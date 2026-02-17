pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE = 'healthcare-service'
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        KUBE_CONFIG_CREDENTIALS_ID = 'kubeconfig-credentials'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Code checked out successfully'
            }
        }
        
        stage('Setup Python Environment') {
            steps {
                sh '''
                    python3 -m venv venv
                    . venv/bin/activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                    pip install flake8 pytest pytest-cov
                '''
            }
        }
        
        stage('Lint') {
            steps {
                sh '''
                    . venv/bin/activate
                    flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
                    flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
                '''
            }
        }
        
        stage('Test') {
            environment {
                DATABASE_URL = 'sqlite:///:memory:'
                FLASK_ENV = 'testing'
            }
            steps {
                sh '''
                    . venv/bin/activate
                    pytest tests/ -v --cov=. --cov-report=xml --cov-report=html --cov-report=term
                '''
            }
            post {
                always {
                    junit 'test-results/*.xml'
                    publishHTML([
                        reportDir: 'htmlcov',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        stage('Security Scan - Dependencies') {
            steps {
                sh '''
                    . venv/bin/activate
                    pip install safety
                    safety check --json || true
                '''
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    def imageTag = "${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                    def latestTag = "${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:latest"
                    
                    sh """
                        docker build -t ${imageTag} -t ${latestTag} .
                    """
                    
                    env.DOCKER_IMAGE_TAG = imageTag
                }
            }
        }
        
        stage('Security Scan - Docker Image') {
            steps {
                sh '''
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy image --severity HIGH,CRITICAL ${DOCKER_IMAGE_TAG}
                '''
            }
        }
        
        stage('Push Docker Image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry("https://${env.DOCKER_REGISTRY}", env.DOCKER_CREDENTIALS_ID) {
                        sh """
                            docker push ${env.DOCKER_IMAGE_TAG}
                            docker push ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
                script {
                    withKubeConfig([credentialsId: env.KUBE_CONFIG_CREDENTIALS_ID]) {
                        sh '''
                            kubectl apply -f k8s/namespace.yaml
                            kubectl apply -f k8s/configmap.yaml
                            kubectl apply -f k8s/secret.yaml
                            kubectl apply -f k8s/pvc.yaml
                            kubectl apply -f k8s/db-deployment.yaml
                            kubectl apply -f k8s/deployment.yaml
                            kubectl apply -f k8s/service.yaml
                            kubectl apply -f k8s/ingress.yaml
                            
                            # Wait for deployment to complete
                            kubectl rollout status deployment/healthcare-service -n healthcare-service --timeout=5m
                        '''
                    }
                }
            }
        }
        
        stage('Verify Deployment') {
            when {
                branch 'main'
            }
            steps {
                script {
                    withKubeConfig([credentialsId: env.KUBE_CONFIG_CREDENTIALS_ID]) {
                        sh '''
                            kubectl get pods -n healthcare-service
                            kubectl get svc -n healthcare-service
                            
                            # Run smoke test
                            sleep 30
                            SERVICE_URL=$(kubectl get svc healthcare-service -n healthcare-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
                            curl -f http://${SERVICE_URL}/health || exit 1
                        '''
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
            emailext(
                subject: "Jenkins Build Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Build ${env.BUILD_NUMBER} completed successfully.\n\nCheck console output at ${env.BUILD_URL}",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        failure {
            echo 'Pipeline failed!'
            emailext(
                subject: "Jenkins Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Build ${env.BUILD_NUMBER} failed.\n\nCheck console output at ${env.BUILD_URL}",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
