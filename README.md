# 🚀 Project: End-to-End Microservices Deployment on AWS (E2E-MS)

## 📌 Objective

Design, containerize, secure, and deploy a microservices-based application (`e2ems`) using AWS, Kubernetes, CI/CD, and observability tools.

---

## 🧱 Architecture Overview

![Image](https://images.openai.com/static-rsc-4/3yziTh0dIsRcBC9T4NQyztc2cWGsCyHoVy2lRqLWIYOHXwrXKNhQE2qu_ncWev2nYyWZi-Rplq-c_VKFPAWTAYotekLnbPwZC9osg0Z6WhlJouvaEULyfQHHJEF2fdy4LuzF7EoPYeiPZnIIG9phl0Ufg-7c6ox6nj0ZG94nSDTJKvLT2yueIfeSu84nxIRT?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/EzPL96NOj8z2OJbgi_NgbAMnh5X4wufjxm4eqJCQnLfEtUI_Sbq10zqz1zZ44PURV9DjDF6mIV_5oicFvpNyFTs5m08vJ9DDe5-suxl1DAHUnYOEdtAOmGZjCoHxJLjrIavmKmK9cUSCEcn4zb7tYgCLU9b3nwRUeYChlCGWohe4gYjd1AlIQFbQR93Gu0P6?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/zFMMBSeVMrs3rD4uVSUGuRrUrSgXnM-nppMQtDi1mQlNrQCx5roBQTVxVgdYQ0BzNwK7gCtEC_UY1bzfS_5yCpJXcPdSuSPbzMzCj2j9SBzkIDpcN81Hpdgf6lV35xf1rce_5LRHEOp4W1n2obhyotuqnAYfRIaq9rOz5O1RN_81syfIVknDYysB9huX_5Hu?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/7-yCTxBDZ4ioDS6XlFUp4LrqjS2hKvY9IOhc9BDj1GdnR0GWrFT3bqyx4LToiPETMRJjME3-n1MATfMK5gDHzFrQyZy8rt7rQfxwpLbVNARPcuv3C6hcK8fXTohk5gkB08DkhjJun9VREHkARC9ASjQ1PJiClY4b9T4LYVmX86QArbiUBKsHcrf3y3CemXtD?purpose=fullsize)

---

## 🧩 Given System

You are provided with a microservices-based app:

* **Authentication Service**
* **Transaction Service**
* **Frontend (Next.js)**
* **PostgreSQL Database**

Each service except the frontend has its own `.env` file.

---

## 🛠️ Tasks Breakdown

### 🔹 1. Infrastructure Provisioning (AWS)

Provision the following:

* Create an **EKS Cluster** using:

  * `eksctl` OR Terraform (bonus)
* Create a **PostgreSQL RDS instance**
* Launch at least **1 EC2 instance** (for bastion / admin access)

✅ Requirements:

* Use proper VPC, subnets, and security groups
* RDS should only allow access from EKS nodes

---

## 🔹 2. Database Setup (NEW)

After creating RDS:

### Tasks:

* Connect to PostgreSQL (via EC2 or local tunnel)
* Run `db.sql` provided

### ✅ Requirements:

* Create:

  * Database
  * Tables
  * Indexes (if defined)

Example:

```bash
psql -h <rds-endpoint> -U <username> -d postgres -f db.sql
```

* Verify:

```sql
\dt
SELECT * FROM users;
```
---

### 🔹 2. Dockerization

Dockerize each backend service:

* `authentication`
* `transaction`

✅ Requirements:

* Multi-stage Docker builds
* Optimize image size
* Use `.dockerignore`

Example deliverables:

* `Dockerfile` for each service


---

### 🔹 3. Container Registry

* Push images to:

  * Amazon Elastic Container Registry (ECR) or Dockerhub

✅ Requirements:

* Use separate repositories per service
* Tag images properly 

---

### 🔹 4. CI/CD Pipeline

Use:

* GitHub Actions

Pipeline stages:

#### 🔄 Build & Test

* Install dependencies
* Run lint/tests

#### 🔐 Code Scanning

* Use:

  * Sonarqube

#### 🐳 Container Scanning

* Use:

  * Trivy

#### 📦 Build & Push Image

* Build Docker image
* Push to ECR or Dockerhub

---

### 🔹 5. Kubernetes Deployment

Create manifests for:

* `authentication` service
* `transaction` service

Resources to define:

* Deployment
* Service (ClusterIP)
* ConfigMap / Secrets
* Ingress (optional but recommended)

✅ Requirements:

* Use environment variables from Secrets
* Use readiness/liveness probes

---

### 🔹 6. GitOps Deployment

Use:

* ArgoCD

Tasks:

* Install ArgoCD in EKS
* Connect GitHub repo
* Deploy backend services via ArgoCD

✅ Requirements:

* Use declarative manifests
* Auto-sync enabled

---

### 🔹 7. Frontend Deployment

Deploy Next.js frontend as static site:

* Use:

  * Amazon S3
  * (Optional) CloudFront CDN

✅ Steps:

* Build static export (`next build && next export`)
* Upload to S3
* Enable static website hosting

## 🔧 B. Build Static App

```bash
npm run build
npm run export
```

---

### 🔄 C. Auto Sync to S3 (NEW)

Automate deployment using:

* AWS CLI inside GitHub Actions

### Example Step:

```yaml
- name: Sync to S3
  run: |
    aws s3 sync ./out s3://your-bucket-name --delete
```

### ✅ Requirements:

* Auto-deploy on:

  * `main` branch push
* Enable S3 static hosting
* (Optional) Add CloudFront

---

### 🔧 A. Environment Fix (MANDATORY)

Before build:

👉 Update API base URL in:

```
frontend/lib/api.js
```

Example:

```js
const BASE_URL = "http://<your-ingress-or-api-url>";
```

❗ This replaces `.env` usage for frontend runtime.

---


### 🔹 8. Observability (Monitoring)

Install:

* Prometheus
* Grafana

![Image](https://images.openai.com/static-rsc-4/JWam0Nis_PoWc4dswcXQg0p7qZc7ym-XGYNr17VYtfbK7UAjhRXP3rZ3QfNGkbrcnwvEOFAwQ8rZ9RBcr6od1ONI7VgIBwoMNn1v6kk9oXO939qwq6i_aVXxZWWzcOiHmMBu69Jm6AB0NdN-n6-E61WwsjwuVmwZ8WREnJUxlNF_yHgGzUFXtBWu1K6RvBwW?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/DezvAihj86GLYv7twvPYmUx8zTE95CKH2aoT4IHNSWMjxPMq0SEzYCCpnxSk1B6GEfo2BnlinBf-wggq1kCl_M62vH2Ip9Bhh0-bpaAs2whrcjAg7OFenXMMirgEI8UIMQl4o74uuUD_VU5Kfbrsc1uvSpjPsLnT8WHdiJHZyEwGkiZpBpBLfrS-xUj50LOf?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/nuIrkZkkixa7woirKy98bN2SzjfSrrfjUTa959jtrxsJYIsi_Exl2uoOW_GBqCBRjNJVCq9PqcqoxOObqO5V_qU22bhqOp6oO1Z-v6_tOXupd-jG86VIlMWvAlPApIV9W4RjWRPvKwZlh-Zbm_NAc_sU3PwNZMIsOH82fJlObdd8T0-odoQ4zki0QZMq-tLe?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/GWE8jMzjLhseJ3qsY0BdR-KedjjduQo4mMJleI2bSGaXflwrHe30_HCzd7JYYk-0E0u4IC9daUN5y7l4Yb0fbzDwbqtRGPbseupGkRkcXLOj22sqQIN962i1b52zKTDQ5AiQZZKRLeEfS_mTq4XbrLAuPEA8qbKr3YX2S7xSazEqI1iW4aH4Uif5XnsTNeH2?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/-fE3fWVl4T1o3nDmvTAx2UfbNo2FZf86VDNoKBfPoKGh2U7pQJLbz3-ghvwqJbFVFPQ0QTRxDNgg5aCHOzR5jScNzAxnHq9zx_UAPtaL1D1UPNsb6GDcqdqzciVOar6AFKe3ogL62oO4nF9k6nX_hUlshedh6drZrimEsWgpNTbUJ6cFHsKzMgx65PEacvUg?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/AOWHStu3dFOGSKF-c3wCz3qLOQr8HEtBJrXI8Ce-F40Zu0nKGEQOJw-EHIu3A4qcKKd3suiO_TfYOhQ0JxoN65ZMBekISZ0-wTkh9Vpc5CI6swSCbHgoqqo3A-0Fh16QWnAE9ntXdJYUS8AfSZJFKyYOWwOAd23L_y9K_q_B9oMaBxok5i0kACgUPT_o0vw2?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/20nYRIJT8uWB-Ry0JeOFt4GNi4A6hsmTJn4SOKGQ5wK0SjsZLpeBgjNPPHPMZ_NiPLZBL7US9cOt7hp7hppg59FJYEdsEgYk70taTajxrE2XkHR2MpyAerVlsO2fJoSPUcp04fJsUxWypkY85oD0XAAIL7DXGBcc9N6XjrSF406wI-eZOtUpAK-mb5OpXqYe?purpose=fullsize)

✅ Requirements:

* Monitor:

  * CPU / Memory
  * Pod health
  * Request metrics
* Create at least 1 dashboard

---

### 🔹 9. Logging (ELK Stack)

Install:

* Elasticsearch
* Logstash
* Kibana

![Image](https://images.openai.com/static-rsc-4/DA3eB2QbKH4h-JsmQ5stjD-OOFxx1Zno2pWFSyNZLILmvPlqHb61FyuEeqHD95RKR8c4Y7L6tZSrqOsISzIwbuLVITYbaFEzw6eZXd_bpJj87yqf_oWpBeRtzrZJGPxsBiA5OJZ6M8EDKkW5E8GhW2Bu5hzQAO9r_qggfeor9kZrysiljl-Mc4X89J95vN6w?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/Is46nE4NZVpkINcym06Be7RoAr3ceHSJVvRSa_bbg4iaYqX1j6BbfEXXeJp30mVzpWYuNnIY9Eq663UFPRHG0Q_nKeS8YeielmIK-wvgzvfGk93VPJv3yfmj5EChlwktt51qpfjvb5bCJ_5ruM6CMnpQJnbBBoOSeYaNJv-mX8xJwtlZdS1fbbw-HnICsltD?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/R1uyxHnr3nHB6MIn1nytZbVnhdRdrwbiyvUFGI5WFCrzd6DlYwmCQ2hGOzOQAQTj2A1FBpl0L0uloY9aJNUd0nCl5X2VTzcjMKDJ_y5WnCY1XQcaGwGNTx0emXGdW9hX6wweS5ILc_ms5SPcsZfYmjsRFe2JT77wk0Ax2b91dgWeFBcx76kF4ujdK4bTn6NJ?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/Nek0bgCeZdpUY4Kuml_LSB8XxB4G34qqog8FsOKff6FOuV4Cj_X31UrXDtshLW75gD7dUxYeZG3n6IpQ186Gs1_R1ISHQCJSpqge4dIX7bMG11XLz9nVg8YJa9sBcBwrbBKvnZQcCfH37UpN0GsQudJbVwfjIVOLz4PoFhjyiCw8XPw1DKrQLVYMIAj7RJfF?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/LwacFV_fyRMHTVQYkWXUNSObGJsBx3Z4_xoSZy8BCmAo8GyiDRwF4UgfPS17W4loGZs1l7wVzEVK6yJOvw9-QClkgQL8O6XapyYqP0ZdhHaL9EKI7cQ0mOPb_o-PpKn5YLbJJVK1_NpZxM8rewndjuUdnE27obQgn6LuXUBoIkLVz-iG2nx2IrgYK-Rcu5ch?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/bPtGbAiYpyLqX1tsDNbrJJUgCQ0kB-hJVQ-Z84vTxABD1DZXMJ4Uv8XfJtrhghUpRk-r8fI6L-L_VbBoiuQ5L1AK-weLe0X7vJbMmU9YXZYTDzf1O4HEcSCwgyhvpa4U158tIBAOmPgTkGQshoePa0fApcqL4Mt_vybIrezAuXZBdmbqnWSOQWoCOB04_mGb?purpose=fullsize)

✅ Requirements:

* Centralized logging from pods
* View logs in Kibana
* Filter logs by service

---

## 📦 Deliverables

Students must submit:

* GitHub repository
* Dockerfiles
* Kubernetes manifests
* GitHub Actions workflows
* ArgoCD application config
* Screenshots:

  * Running pods
  * Grafana dashboard
  * Kibana logs
* Architecture diagram

---

## ⭐ Bonus Tasks

* Use Helm charts instead of raw manifests
* Add HTTPS using Ingress + Cert Manager
* Implement autoscaling (HPA)
* Use Terraform for full infra provisioning
* Add rate limiting / API gateway

---

## 🧠 Evaluation Criteria

| Category             | Weight |
| -------------------- | ------ |
| Infrastructure Setup | 20%    |
| Dockerization        | 15%    |
| CI/CD Pipeline       | 20%    |
| Kubernetes           | 15%    |
| GitOps (ArgoCD)      | 10%    |
| Observability        | 10%    |
| Logging              | 10%    |


