# 7. System Architecture (시스템 아키텍처) - 시스템 구축 상세 설계

## 1. 시스템 계층 구조 상세 (System Layer Architecture)

### 1.1. 사용자 및 파트너 계층 (Presentation & Network Layer)
* **B2C (반려인 앱) & B2B/B2G (웹 대시보드):**
  * **정적 호스팅 & CDN:** 프론트엔드(Vue3/Vite) 자산은 **AWS S3**에 호스팅되며 **Amazon CloudFront**를 통해 글로벌 트래픽 분산과 캐싱 처리를 수행하여 빠른 로딩을 보장합니다.
  * **API 게이트웨이:** 외부의 모든 요청은 **Amazon API Gateway**를 거쳐 백엔드로 라우팅되며, 웹 공격 방어(AWS WAF) 및 API 요금제/Rate Limit를 관리합니다.

### 1.2. 애플리케이션 및 AI 계층 (Application & AI Layer)
* **AWS Chalice Backend (Serverless Core):**
  * 모놀리식 폴더 구조 하에서 기능별로 계층화된 레이어를 통해 비즈니스 로직을 서빙합니다.
  * Chalice 본체 람다는 동기 API 호출(CRUD, Auth 등)에 대해 3초 수준의 빠른 응답을 반환할 수 있도록 가볍게 유지합니다.
* **비동기 AI Health Scan 엔진 파이프라인 (Worker):**
  * **문제점:** 딥러닝(안면/비문 인식, 영상 기반 보행 분석)의 경우 자원 소모가 크고 API Gateway의 Maximum Timeout(29초) 및 Lambda의 용량 제한 이슈가 발생합니다.
  * **실구축 해결책:** 미디어 원본이 S3에 업로드되면, **Amazon S3 Event Trigger**가 **Amazon SQS** 대기열에 메시지를 전송합니다. 고사양 설정(Memory, Timeout 상향)을 갖춘 **비동기 Worker Lambda (또는 ECS Fargate 모델 서빙 인스턴스)** 가 이미지를 가져와 비만도(BCS) 및 궤적(Gait)을 추론하고 결과를 DB에 업데이트 후, 프론트엔드(SSE, 웹소켓 등)로 처리 완료 알림을 푸시합니다.

### 1.3. 데이터 및 블록체인 계층 (Data & Blockchain Layer)
* **디지털 동물 등록증 (Ledger Database / Blockchain):**
  * 퍼블릭 블록체인은 트랜잭션 비용(Gas)과 초당 처리량(TPS), 데이터 프라이버시 이슈가 큽니다.
  * **실구축 대안:** 트랜잭션 증명과 위변조 방지가 완벽히 지원되는 중앙화/위임 형태의 불변 원장인 **Amazon QLDB (Quantum Ledger Database)** 또는 프라이빗 기반의 **Hyperledger Fabric (Amazon Managed Blockchain)**을 채택하여 신원과 의료 기록을 시계열 데이터로 암호학적 아카이빙합니다.
* **AWS RDS (PostgreSQL):**
  * **Private Subnet** 환경에 격리 배치됩니다. 사용자 정보, 기관 연결망 등 즉각적인 조회가 필요한 RDBMS 데이터이며 물리적/논리적 트랜잭션을 통해 정합성을 보장합니다.
* **오브젝트 스토리지 미디어 분리:**
  * Lambda Request Payload 한계(6MB)를 회피하기 위해, 사진이나 동영상은 백엔드 서버를 절대 관통하지 않습니다. 즉 API 서버를 통해 **S3 Presigned-URL**만 획득(권한 체크 완료)하고 클라이언트(스마트폰)와 S3가 직접 연결되어 파일(Direct Upload)을 송/수신합니다.

## 2. 주요 데이터 흐름 세부 구현 로직 (Data Flow)

1. **등록 단계 (Sync & Async 분리 처리):**
   * 앱(Vue3)에서 S3 Presigned URL 요청 $\rightarrow$ 백엔드(Chalice) 즉각 발급 $\rightarrow$ 앱에서 S3로 비접촉 안면 스캔 영상 바이너리 직접 업로드.
   * **SQS $\rightarrow$ AI Worker:** 생체 특징점 추출 (고차원 Vector화) $\rightarrow$ 불변 원장(QLDB)에 고유 등록증 (해시 포함) Insert $\rightarrow$ 관계형 DB(PostgreSQL/SQLModel)에는 QLDB Document ID와 소유주 매핑 정보 업데이트.
2. **진료 단계 (의료 기록 트랜잭션):**
   * B2B 수의사 시스템에서 진료/처방 이력 전송 $\rightarrow$ Chalice API 파싱 및 권한(B2B_HOSPITAL) 확인 $\rightarrow$ QLDB 원장에 **Append-only** 시계열 트랜잭션으로 대상 동물 ID 아래 하위 기록으로 추가.
3. **검증 단계 (보험사 부정수급 방어 연동):**
   * 보험/제약 시스템(B2B)이 자사 망에서 `GET /api/v1/pets/{pet_id}/verify_claims` 서버 대 서버 API 호출(API Key 기반).
   * 백엔드는 QLDB에 기록된 해시 및 이력을 암호학적으로 검증 후 `is_verified` 값을 리턴하여 수급 자격 심사를 자동화합니다.
4. **분석 단계 (데이터 파이프라인):**
   * 정기 배치(EventBridge + Lambda) 또는 **AWS Glue** 등을 활용하여, 누적된 원장/DB 데이터를 기반으로 동물의 '건강 신용 등급'을 일/주 단위로 재산정 후 파트너사 포털(Cache 적용)에 제공.

> **실제 시스템 구축 시사점 (Architectural Takeaways):**
> 단순 Serverless 백엔드를 넘어, 단일 API/Lambda의 하드 리밋(Timeout/Payload)을 우회할 수 있는 '비동기 파이프라인(SQS + Worker)' 과 'S3 Direct Upload'를 근간으로 재정의했습니다. 또한 속도 및 비용 효율이 낮은 블록체인을 '엔터프라이즈급 위임 원장(Amazon QLDB)'으로 전환함으로써 실무성과 보안, 무결성을 동시에 달성할 수 있도록 구체화하였습니다.
