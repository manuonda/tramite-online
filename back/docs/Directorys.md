src/main/java/com/tramite/online/
│
├── TramiteOnlineApplication.java        ← Clase principal de Spring Boot
│
├── workspace/                           ← MÓDULO 1: Gestión de Workspaces
│   ├── WorkspaceModule.java            (Marker class para Spring Modulith)
│   │
│   ├── domain/                         ← Lógica de negocio y entidades
│   │   ├── model/
│   │   │   ├── WorkSpace.java          (Entidad de dominio - POJO)
│   │   │   ├── WorkSpaceMember.java    (Miembro de workspace con rol)
│   │   │   └── WorkSpaceRole.java      (Enum: OWNER, ADMIN, EDITOR, VIEWER)
│   │   │
│   │   ├── service/
│   │   │   ├── WorkSpaceService.java   (Lógica de negocio principal)
│   │   │   └── WorkSpaceMemberService.java (Gestión de miembros)
│   │   │
│   │   ├── repository/                 (Interfaces - Ports)
│   │   │   ├── WorkSpaceRepository.java
│   │   │   └── WorkSpaceMemberRepository.java
│   │   │
│   │   ├── event/                      (Eventos de dominio)
│   │   │   ├── WorkSpaceCreated.java   (Record - evento publicado)
│   │   │   ├── WorkSpaceDeleted.java
│   │   │   ├── WorkSpaceArchived.java
│   │   │   ├── MemberAdded.java
│   │   │   └── MemberRemoved.java
│   │   │
│   │   ├── exception/
│   │   │   ├── WorkSpaceNotFoundException.java
│   │   │   ├── DuplicateWorkSpaceException.java
│   │   │   └── UnauthorizedAccessException.java
│   │   │
│   │   └── validator/
│   │       └── WorkSpaceValidator.java  (Validaciones de negocio)
│   │
│   ├── application/                    ← Casos de uso (Use Cases)
│   │   ├── usecase/
│   │   │   ├── CreateWorkSpaceUseCase.java
│   │   │   ├── UpdateWorkSpaceUseCase.java
│   │   │   ├── DeleteWorkSpaceUseCase.java
│   │   │   ├── ArchiveWorkSpaceUseCase.java
│   │   │   ├── ListWorkSpacesUseCase.java
│   │   │   ├── GetWorkSpaceByIdUseCase.java
│   │   │   ├── AddMemberUseCase.java
│   │   │   ├── RemoveMemberUseCase.java
│   │   │   └── UpdateMemberRoleUseCase.java
│   │   │
│   │   └── dto/                        (DTOs para casos de uso)
│   │       ├── CreateWorkSpaceCommand.java (Record - comando de entrada)
│   │       ├── UpdateWorkSpaceCommand.java
│   │       ├── WorkSpaceResponse.java      (Record - respuesta)
│   │       └── MemberResponse.java
│   │
│   └── infrastructure/                 ← Adaptadores externos
│       ├── web/                        (REST API)
│       │   ├── controller/
│       │   │   ├── WorkSpaceController.java
│       │   │   └── WorkSpaceMemberController.java
│       │   │
│       │   └── dto/                    (DTOs para API REST)
│       │       ├── WorkSpaceRequest.java
│       │       ├── WorkSpaceListResponse.java
│       │       ├── AddMemberRequest.java
│       │       └── MemberListResponse.java
│       │
│       ├── persistence/                (JPA/Base de datos)
│       │   ├── entity/
│       │   │   ├── WorkSpaceEntity.java    (Entidad JPA con anotaciones)
│       │   │   └── WorkSpaceMemberEntity.java
│       │   │
│       │   ├── repository/
│       │   │   ├── WorkSpaceJpaRepository.java (extends JpaRepository)
│       │   │   └── WorkSpaceMemberJpaRepository.java
│       │   │
│       │   ├── adapter/
│       │   │   ├── WorkSpaceRepositoryAdapter.java (Implementa port de dominio)
│       │   │   └── WorkSpaceMemberRepositoryAdapter.java
│       │   │
│       │   └── mapper/
│       │       ├── WorkSpaceMapper.java     (Convierte Entity ↔ Domain)
│       │       └── WorkSpaceMemberMapper.java
│       │
│       └── config/
│           └── WorkSpaceConfig.java         (Configuración específica del módulo)
│
├── form/                                ← MÓDULO 2: Diseño de Formularios
│   ├── FormModule.java
│   │
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Form.java                   (Formulario - entidad de dominio)
│   │   │   ├── Section.java                (Sección del formulario)
│   │   │   ├── Question.java               (Pregunta individual)
│   │   │   ├── QuestionType.java           (Enum: TEXT, SELECT, CHECKBOX, FILE, DATE, etc.)
│   │   │   ├── QuestionConfiguration.java   (Configuración por tipo de pregunta)
│   │   │   ├── FormStatus.java             (Enum: DRAFT, PUBLISHED, ARCHIVED)
│   │   │   │
│   │   │   └── configuration/              (Configuraciones específicas)
│   │   │       ├── TextFieldConfig.java    (minLength, maxLength, pattern)
│   │   │       ├── SelectFieldConfig.java  (options, allowMultiple)
│   │   │       ├── FileUploadConfig.java   (maxSize, allowedTypes)
│   │   │       ├── DateFieldConfig.java    (minDate, maxDate, format)
│   │   │       ├── NumberFieldConfig.java  (min, max, decimals)
│   │   │       └── CheckboxFieldConfig.java
│   │   │
│   │   ├── service/
│   │   │   ├── FormService.java            (Lógica de negocio de formularios)
│   │   │   ├── SectionService.java         (Gestión de secciones)
│   │   │   ├── QuestionService.java        (Gestión de preguntas)
│   │   │   └── FormValidationService.java  (Validación de estructura del form)
│   │   │
│   │   ├── repository/
│   │   │   ├── FormRepository.java
│   │   │   ├── SectionRepository.java
│   │   │   ├── QuestionRepository.java
│   │   │   └── QuestionConfigRepository.java
│   │   │
│   │   ├── event/
│   │   │   ├── FormCreated.java
│   │   │   ├── FormPublished.java
│   │   │   ├── FormUnpublished.java
│   │   │   ├── FormDeleted.java
│   │   │   ├── SectionAdded.java
│   │   │   ├── QuestionAdded.java
│   │   │   └── QuestionUpdated.java
│   │   │
│   │   ├── exception/
│   │   │   ├── FormNotFoundException.java
│   │   │   ├── InvalidFormStructureException.java
│   │   │   └── FormAlreadyPublishedException.java
│   │   │
│   │   └── validator/
│   │       ├── FormValidator.java          (Valida estructura completa)
│   │       ├── QuestionValidator.java      (Valida pregunta según tipo)
│   │       └── ConditionalLogicValidator.java
│   │
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── CreateFormUseCase.java
│   │   │   ├── UpdateFormUseCase.java
│   │   │   ├── PublishFormUseCase.java
│   │   │   ├── UnpublishFormUseCase.java
│   │   │   ├── DeleteFormUseCase.java
│   │   │   ├── DuplicateFormUseCase.java
│   │   │   ├── AddSectionUseCase.java
│   │   │   ├── ReorderSectionsUseCase.java
│   │   │   ├── AddQuestionUseCase.java
│   │   │   ├── UpdateQuestionUseCase.java
│   │   │   ├── DeleteQuestionUseCase.java
│   │   │   ├── ConfigureQuestionUseCase.java
│   │   │   └── GetFormByIdUseCase.java
│   │   │
│   │   └── dto/
│   │       ├── CreateFormCommand.java
│   │       ├── UpdateFormCommand.java
│   │       ├── PublishFormCommand.java
│   │       ├── FormResponse.java
│   │       ├── SectionResponse.java
│   │       ├── QuestionResponse.java
│   │       └── QuestionConfigResponse.java
│   │
│   └── infrastructure/
│       ├── web/
│       │   ├── controller/
│       │   │   ├── FormController.java
│       │   │   ├── SectionController.java
│       │   │   └── QuestionController.java
│       │   │
│       │   └── dto/
│       │       ├── FormRequest.java
│       │       ├── SectionRequest.java
│       │       ├── QuestionRequest.java
│       │       └── QuestionConfigRequest.java
│       │
│       ├── persistence/
│       │   ├── entity/
│       │   │   ├── FormEntity.java
│       │   │   ├── SectionEntity.java
│       │   │   ├── QuestionEntity.java
│       │   │   └── QuestionConfigEntity.java
│       │   │
│       │   ├── repository/
│       │   │   ├── FormJpaRepository.java
│       │   │   ├── SectionJpaRepository.java
│       │   │   ├── QuestionJpaRepository.java
│       │   │   └── QuestionConfigJpaRepository.java
│       │   │
│       │   ├── adapter/
│       │   │   ├── FormRepositoryAdapter.java
│       │   │   ├── SectionRepositoryAdapter.java
│       │   │   └── QuestionRepositoryAdapter.java
│       │   │
│       │   └── mapper/
│       │       ├── FormMapper.java
│       │       ├── SectionMapper.java
│       │       ├── QuestionMapper.java
│       │       └── QuestionConfigMapper.java
│       │
│       └── config/
│           └── FormConfig.java
│
├── submission/                          ← MÓDULO 3: Respuestas de Usuarios
│   ├── SubmissionModule.java
│   │
│   ├── domain/
│   │   ├── model/
│   │   │   ├── FormSubmission.java         (Envío completo del usuario)
│   │   │   ├── Answer.java                 (Respuesta individual a pregunta)
│   │   │   ├── SubmissionStatus.java       (Enum: DRAFT, SUBMITTED, REVIEWED, APPROVED, REJECTED)
│   │   │   ├── AnswerValueType.java        (Enum: TEXT, NUMBER, DATE, JSON, FILE_URL)
│   │   │   └── SubmissionMetadata.java     (IP, browser, device, timestamps)
│   │   │
│   │   ├── service/
│   │   │   ├── SubmissionService.java      (Lógica de negocio de submissions)
│   │   │   ├── AnswerService.java          (Gestión de respuestas)
│   │   │   ├── SubmissionValidationService.java (Valida respuestas vs form)
│   │   │   └── FileStorageService.java     (Manejo de archivos subidos)
│   │   │
│   │   ├── repository/
│   │   │   ├── SubmissionRepository.java
│   │   │   └── AnswerRepository.java
│   │   │
│   │   ├── event/
│   │   │   ├── FormSubmitted.java          (Usuario envía formulario)
│   │   │   ├── SubmissionUpdated.java
│   │   │   ├── SubmissionApproved.java
│   │   │   ├── SubmissionRejected.java
│   │   │   └── SubmissionDeleted.java
│   │   │
│   │   ├── exception/
│   │   │   ├── SubmissionNotFoundException.java
│   │   │   ├── InvalidAnswerException.java
│   │   │   ├── FormNotPublishedException.java
│   │   │   └── DuplicateSubmissionException.java
│   │   │
│   │   └── validator/
│   │       ├── SubmissionValidator.java    (Valida submission completo)
│   │       └── AnswerValidator.java        (Valida respuesta según tipo de pregunta)
│   │
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── SubmitFormUseCase.java      (Usuario envía formulario)
│   │   │   ├── SaveDraftUseCase.java       (Guardar borrador)
│   │   │   ├── UpdateSubmissionUseCase.java
│   │   │   ├── DeleteSubmissionUseCase.java
│   │   │   ├── GetSubmissionByIdUseCase.java
│   │   │   ├── ListSubmissionsByFormUseCase.java
│   │   │   ├── ApproveSubmissionUseCase.java
│   │   │   ├── RejectSubmissionUseCase.java
│   │   │   └── UploadFileUseCase.java      (Subir archivos adjuntos)
│   │   │
│   │   ├── dto/
│   │   │   ├── SubmitFormCommand.java
│   │   │   ├── SaveDraftCommand.java
│   │   │   ├── AnswerCommand.java
│   │   │   ├── SubmissionResponse.java
│   │   │   ├── AnswerResponse.java
│   │   │   └── FileUploadResponse.java
│   │   │
│   │   └── listener/
│   │       └── FormEventListener.java      (Escucha FormPublished, FormDeleted)
│   │
│   └── infrastructure/
│       ├── web/
│       │   ├── controller/
│       │   │   ├── SubmissionController.java (API pública para usuarios)
│       │   │   ├── SubmissionAdminController.java (API para admins)
│       │   │   └── FileUploadController.java
│       │   │
│       │   └── dto/
│       │       ├── SubmissionRequest.java
│       │       ├── AnswerRequest.java
│       │       ├── SubmissionListResponse.java
│       │       └── FileUploadRequest.java
│       │
│       ├── persistence/
│       │   ├── entity/
│       │   │   ├── SubmissionEntity.java
│       │   │   └── AnswerEntity.java
│       │   │
│       │   ├── repository/
│       │   │   ├── SubmissionJpaRepository.java
│       │   │   └── AnswerJpaRepository.java
│       │   │
│       │   ├── adapter/
│       │   │   ├── SubmissionRepositoryAdapter.java
│       │   │   └── AnswerRepositoryAdapter.java
│       │   │
│       │   └── mapper/
│       │       ├── SubmissionMapper.java
│       │       └── AnswerMapper.java
│       │
│       ├── storage/                        (Almacenamiento de archivos)
│       │   ├── FileStorageAdapter.java     (Implementación de FileStorageService)
│       │   ├── LocalFileStorage.java       (Almacenamiento local)
│       │   └── S3FileStorage.java          (Almacenamiento en AWS S3 - futuro)
│       │
│       └── config/
│           ├── SubmissionConfig.java
│           └── FileStorageConfig.java
│
├── analytics/                           ← MÓDULO 4: Análisis y Reportes
│   ├── AnalyticsModule.java
│   │
│   ├── domain/
│   │   ├── model/
│   │   │   ├── FormAnalytics.java          (Estadísticas del formulario)
│   │   │   ├── QuestionAnalytics.java      (Stats por pregunta)
│   │   │   ├── SubmissionSummary.java      (Resumen de submission)
│   │   │   ├── TimeSeries.java             (Datos temporales)
│   │   │   └── ExportFormat.java           (Enum: CSV, EXCEL, PDF, JSON)
│   │   │
│   │   ├── service/
│   │   │   ├── AnalyticsService.java       (Cálculos de estadísticas)
│   │   │   ├── ReportGeneratorService.java (Generación de reportes)
│   │   │   ├── ExportService.java          (Exportación de datos)
│   │   │   └── ChartDataService.java       (Datos para gráficos)
│   │   │
│   │   ├── repository/
│   │   │   └── AnalyticsRepository.java    (Queries especializadas)
│   │   │
│   │   └── calculator/                     (Cálculos específicos)
│   │       ├── ResponseRateCalculator.java
│   │       ├── AverageTimeCalculator.java
│   │       ├── CompletionRateCalculator.java
│   │       └── TrendAnalysisCalculator.java
│   │
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── GetFormAnalyticsUseCase.java
│   │   │   ├── GetSubmissionListUseCase.java
│   │   │   ├── GetSubmissionDetailUseCase.java
│   │   │   ├── GenerateReportUseCase.java
│   │   │   ├── ExportSubmissionsUseCase.java (CSV/Excel/PDF)
│   │   │   ├── GetQuestionStatsUseCase.java
│   │   │   └── GetTimeSeriesDataUseCase.java
│   │   │
│   │   ├── dto/
│   │   │   ├── FormAnalyticsResponse.java
│   │   │   ├── QuestionStatsResponse.java
│   │   │   ├── SubmissionSummaryResponse.java
│   │   │   ├── ExportRequest.java
│   │   │   └── TimeSeriesResponse.java
│   │   │
│   │   └── listener/
│   │       └── SubmissionEventListener.java (Escucha FormSubmitted)
│   │
│   └── infrastructure/
│       ├── web/
│       │   ├── controller/
│       │   │   ├── AnalyticsController.java
│       │   │   ├── ReportController.java
│       │   │   └── ExportController.java
│       │   │
│       │   └── dto/
│       │       ├── AnalyticsRequest.java
│       │       ├── AnalyticsDashboardResponse.java
│       │       └── ExportResponse.java
│       │
│       ├── persistence/
│       │   ├── repository/
│       │   │   └── AnalyticsJpaRepository.java (Queries custom con @Query)
│       │   │
│       │   └── projection/                  (Proyecciones para queries)
│       │       ├── SubmissionCountProjection.java
│       │       ├── QuestionStatsProjection.java
│       │       └── TimeSeriesProjection.java
│       │
│       ├── export/                          (Generadores de archivos)
│       │   ├── CsvExporter.java
│       │   ├── ExcelExporter.java
│       │   ├── PdfExporter.java
│       │   └── JsonExporter.java
│       │
│       └── config/
│           ├── AnalyticsConfig.java
│           └── ExportConfig.java
│
├── user/                                ← MÓDULO 5: Usuarios y Autenticación
│   ├── UserModule.java
│   │
│   ├── domain/
│   │   ├── model/
│   │   │   ├── User.java                   (Usuario del sistema)
│   │   │   ├── UserProfile.java            (Perfil del usuario)
│   │   │   ├── UserRole.java               (Enum: USER, ADMIN, SUPER_ADMIN)
│   │   │   ├── AuthProvider.java           (Enum: LOCAL, GOOGLE, GITHUB)
│   │   │   └── UserStatus.java             (Enum: ACTIVE, INACTIVE, SUSPENDED)
│   │   │
│   │   ├── service/
│   │   │   ├── UserService.java            (Lógica de negocio de usuarios)
│   │   │   ├── AuthenticationService.java  (Autenticación y tokens)
│   │   │   ├── PasswordService.java        (Encriptación de passwords)
│   │   │   └── UserProfileService.java     (Gestión de perfiles)
│   │   │
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   └── UserProfileRepository.java
│   │   │
│   │   ├── event/
│   │   │   ├── UserRegistered.java
│   │   │   ├── UserLoggedIn.java
│   │   │   ├── UserLoggedOut.java
│   │   │   ├── UserUpdated.java
│   │   │   ├── PasswordChanged.java
│   │   │   └── UserSuspended.java
│   │   │
│   │   └── exception/
│   │       ├── UserNotFoundException.java
│   │       ├── DuplicateEmailException.java
│   │       ├── InvalidCredentialsException.java
│   │       └── UserSuspendedException.java
│   │
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── RegisterUserUseCase.java
│   │   │   ├── LoginUserUseCase.java
│   │   │   ├── LogoutUserUseCase.java
│   │   │   ├── UpdateUserProfileUseCase.java
│   │   │   ├── ChangePasswordUseCase.java
│   │   │   ├── GetUserByIdUseCase.java
│   │   │   ├── SuspendUserUseCase.java
│   │   │   └── RefreshTokenUseCase.java
│   │   │
│   │   └── dto/
│   │       ├── RegisterUserCommand.java
│   │       ├── LoginCommand.java
│   │       ├── UserResponse.java
│   │       ├── AuthResponse.java           (token, refreshToken, user)
│   │       └── UpdateProfileCommand.java
│   │
│   └── infrastructure/
│       ├── web/
│       │   ├── controller/
│       │   │   ├── AuthController.java     (Login, Register, Logout)
│       │   │   ├── UserController.java     (CRUD de usuarios)
│       │   │   └── ProfileController.java  (Perfil del usuario)
│       │   │
│       │   └── dto/
│       │       ├── LoginRequest.java
│       │       ├── RegisterRequest.java
│       │       ├── TokenResponse.java
│       │       └── ProfileRequest.java
│       │
│       ├── persistence/
│       │   ├── entity/
│       │   │   ├── UserEntity.java
│       │   │   └── UserProfileEntity.java
│       │   │
│       │   ├── repository/
│       │   │   ├── UserJpaRepository.java
│       │   │   └── UserProfileJpaRepository.java
│       │   │
│       │   ├── adapter/
│       │   │   ├── UserRepositoryAdapter.java
│       │   │   └── UserProfileRepositoryAdapter.java
│       │   │
│       │   └── mapper/
│       │       ├── UserMapper.java
│       │       └── UserProfileMapper.java
│       │
│       ├── security/                       (Seguridad y OAuth2)
│       │   ├── config/
│       │   │   ├── SecurityConfig.java     (Configuración Spring Security)
│       │   │   ├── OAuth2Config.java       (Configuración OAuth2)
│       │   │   └── JwtConfig.java          (Configuración JWT)
│       │   │
│       │   ├── jwt/
│       │   │   ├── JwtTokenProvider.java   (Generación y validación de tokens)
│       │   │   ├── JwtAuthenticationFilter.java (Filtro para requests)
│       │   │   └── JwtTokenValidator.java
│       │   │
│       │   ├── oauth2/
│       │   │   ├── OAuth2UserService.java  (Custom OAuth2 user service)
│       │   │   ├── OAuth2SuccessHandler.java (Handler after success)
│       │   │   ├── OAuth2FailureHandler.java
│       │   │   ├── GoogleOAuth2UserInfo.java (Extractor de info de Google)
│       │   │   └── GitHubOAuth2UserInfo.java
│       │   │
│       │   └── userdetails/
│       │       ├── CustomUserDetails.java  (Implementa UserDetails)
│       │       └── CustomUserDetailsService.java
│       │
│       └── config/
│           └── UserConfig.java
│
├── notification/                        ← MÓDULO 6: Notificaciones
│   ├── NotificationModule.java
│   │
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Notification.java           (Notificación a enviar)
│   │   │   ├── NotificationType.java       (Enum: EMAIL, SMS, PUSH, IN_APP)
│   │   │   ├── NotificationTemplate.java   (Plantilla de notificación)
│   │   │   └── NotificationStatus.java     (Enum: PENDING, SENT, FAILED)
│   │   │
│   │   ├── service/
│   │   │   ├── NotificationService.java    (Orquestación de notificaciones)
│   │   │   ├── EmailService.java           (Envío de emails)
│   │   │   ├── TemplateService.java        (Renderizado de templates)
│   │   │   └── NotificationQueueService.java (Cola de notificaciones)
│   │   │
│   │   └── repository/
│   │       ├── NotificationRepository.java
│   │       └── TemplateRepository.java
│   │
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── SendEmailUseCase.java
│   │   │   ├── SendBulkEmailUseCase.java
│   │   │   └── GetNotificationHistoryUseCase.java
│   │   │
│   │   ├── dto/
│   │   │   ├── EmailRequest.java
│   │   │   ├── NotificationResponse.java
│   │   │   └── TemplateData.java
│   │   │
│   │   └── listener/                       (Escucha eventos de otros módulos)
│   │       ├── WorkSpaceEventListener.java (WorkSpaceCreated → email bienvenida)
│   │       ├── FormEventListener.java      (FormPublished → notificar miembros)
│   │       ├── SubmissionEventListener.java (FormSubmitted → notificar admins)
│   │       └── UserEventListener.java      (UserRegistered → email confirmación)
│   │
│   └── infrastructure/
│       ├── email/                          (Implementación de envío de emails)
│       │   ├── EmailSenderAdapter.java     (Implementa EmailService)
│       │   ├── SmtpEmailSender.java        (Envío via SMTP)
│       │   ├── SendGridEmailSender.java    (Futuro: SendGrid)
│       │   └── EmailTemplateRenderer.java  (Renderiza HTML templates)
│       │
│       ├── persistence/
│       │   ├── entity/
│       │   │   ├── NotificationEntity.java
│       │   │   └── TemplateEntity.java
│       │   │
│       │   ├── repository/
│       │   │   ├── NotificationJpaRepository.java
│       │   │   └── TemplateJpaRepository.java
│       │   │
│       │   └── adapter/
│       │       └── NotificationRepositoryAdapter.java
│       │
│       ├── template/                       (Templates de emails)
│       │   ├── welcome-email.html
│       │   ├── form-submission-notification.html
│       │   ├── workspace-invitation.html
│       │   └── password-reset.html
│       │
│       └── config/
│           ├── EmailConfig.java            (SMTP configuration)
│           └── NotificationConfig.java
│
└── shared/                              ← MÓDULO COMPARTIDO
├── SharedModule.java
│
├── domain/
│   ├── entity/
│   │   ├── AuditableEntity.java        (Base para entidades con audit)
│   │   └── DomainEvent.java            (Base para eventos)
│   │
│   ├── valueobject/                    (Value Objects comunes)
│   │   ├── Email.java                  (Email validado)
│   │   ├── PhoneNumber.java
│   │   └── Money.java
│   │
│   └── specification/                  (Specifications para queries)
│       └── BaseSpecification.java
│
├── exception/                          (Excepciones globales)
│   ├── BaseException.java              (Excepción base del sistema)
│   ├── ResourceNotFoundException.java
│   ├── ValidationException.java
│   ├── UnauthorizedException.java
│   ├── ForbiddenException.java
│   └── BusinessException.java
│
├── util/                               (Utilidades comunes)
│   ├── DateTimeUtils.java
│   ├── StringUtils.java
│   ├── JsonUtils.java
│   ├── ValidationUtils.java
│   └── SlugGenerator.java
│
├── config/                             (Configuraciones globales)
│   ├── JpaConfig.java                  (Configuración JPA global)
│   ├── CorsConfig.java                 (CORS configuration)
│   ├── AsyncConfig.java                (Async configuration)
│   ├── OpenApiConfig.java              (Swagger/OpenAPI)
│   └── ModulithConfig.java             (Spring Modulith config)
│
└── infrastructure/
├── web/
│   ├── advice/                     (Exception Handlers globales)
│   │   ├── GlobalExceptionHandler.java
│   │   └── ValidationExceptionHandler.java
│   │
│   └── response/                   (Responses estándar)
│       ├── ApiResponse.java        (Wrapper genérico)
│       ├── ErrorResponse.java
│       ├── PageResponse.java
│       └── SuccessResponse.java
│
└── persistence/
├── audit/
│   └── AuditorAwareImpl.java   (Implementación de auditoría)
│
└── converter/                  (JPA Converters)
├── JsonAttributeConverter.java
└── ListStringConverter.java