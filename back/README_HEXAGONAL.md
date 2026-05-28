# Arquitectura Hexagonal — Order Management System (OMS)

## Stack Tecnológico

| Categoría        | Tecnología                          | Versión     |
|------------------|-------------------------------------|-------------|
| Lenguaje         | Java                                | 21          |
| Framework        | Spring Boot                         | 3.5.6       |
| Persistencia     | Spring Data JPA + Hibernate         | Boot 3.5.6  |
| Base de datos    | PostgreSQL                          | 42.7.8      |
| Migraciones DB   | Liquibase                           | 4.33.0      |
| Mensajería       | RabbitMQ (Spring AMQP)              | Boot 3.5.6  |
| Autenticación    | JWT — jjwt                          | 0.13.0      |
| Pagos            | Stripe SDK                          | 29.5.0      |
| Seguridad        | Spring Security                     | Boot 3.5.6  |
| Notificaciones   | Spring Mail + Thymeleaf             | Boot 3.5.6  |
| API Docs         | SpringDoc OpenAPI (Swagger UI)      | 2.8.13      |
| Build            | Maven (multi-module)                | —           |
| Tests            | JUnit 5 + Testcontainers + ArchUnit | —           |

---

## ¿Qué es la Arquitectura Hexagonal?

La **Arquitectura Hexagonal** (también llamada *Ports & Adapters*), propuesta por Alistair Cockburn, tiene como objetivo central **aislar el núcleo de negocio** de todo lo que es infraestructura técnica (base de datos, HTTP, mensajería, pagos, etc.).

La idea es simple: el dominio no sabe nada del mundo exterior. El mundo exterior se conecta al dominio a través de **puertos** (interfaces) e **adaptadores** (implementaciones concretas).

```
                    [ HTTP / REST ]
                          │
                    [ Driver Adapter ]
                          │
              ┌───────────▼────────────┐
              │     APPLICATION        │  ← Casos de uso
              │  ┌─────────────────┐   │
              │  │     DOMAIN      │   │  ← Lógica de negocio pura
              │  └─────────────────┘   │
              └───────────┬────────────┘
                          │
                   [ Driven Adapter ]
                          │
          ┌───────────────┼───────────────┐
    [ PostgreSQL ]   [ RabbitMQ ]    [ Stripe ]
```

### Tipos de Puertos y Adaptadores

| Tipo               | Dirección  | Ejemplo en este proyecto         |
|--------------------|------------|----------------------------------|
| **Driver Adapter** | entra al sistema | `OrderController` (REST)   |
| **Driven Adapter** | sale del sistema | `JpaOrderRepository` (BD)  |
| **Puerto primario**| interfaz de entrada | `OrderCreation` (use case) |
| **Puerto secundario** | interfaz de salida | `PaymentGateway` (Stripe) |

---

## Estructura de Paquetes

El paquete raíz es `io.github.hirannor.oms` y se organiza en **4 capas**:

```
io.github.hirannor.oms/
├── domain/           ← Núcleo puro (sin dependencias de Spring)
├── application/      ← Casos de uso, puertos y orquestación
├── adapter/          ← Implementaciones concretas del exterior
└── infrastructure/   ← Anotaciones y abstracciones base
```

---

## Capa `domain/` — El núcleo

> **Regla:** esta capa no importa Spring ni ningún framework externo. Solo Java puro.

Contiene los **Aggregates Root**, **Value Objects**, **Domain Events** y las interfaces de repositorio.

```
domain/
├── core/
│   └── valueobject/
│       ├── CustomerId.java
│       ├── Money.java
│       ├── Currency.java
│       ├── EmailAddress.java
│       └── ProductQuantity.java
│
├── basket/
│   ├── Basket.java               ← Aggregate Root
│   ├── BasketItem.java
│   ├── BasketStatus.java         ← Enum: ACTIVE | CHECKED_OUT
│   ├── BasketRepository.java     ← Interfaz (puerto secundario)
│   ├── command/
│   │   ├── CreateBasket.java
│   │   ├── CheckoutBasket.java
│   │   ├── AddBasketItem.java
│   │   └── RemoveBasketItem.java
│   └── events/
│       ├── BasketCreated.java
│       └── BasketCheckedOut.java
│
├── order/
│   ├── Order.java                ← Aggregate Root
│   ├── OrderItem.java
│   ├── OrderStatus.java          ← Enum con máquina de estados
│   ├── OrderRepository.java
│   ├── command/
│   │   ├── CreateOrder.java
│   │   └── InitializePayment.java
│   └── events/
│       ├── OrderCreated.java
│       ├── OrderPaid.java
│       ├── OrderShipped.java
│       ├── OrderDelivered.java
│       ├── OrderCanceled.java
│       ├── OrderPaymentFailed.java
│       └── OrderPaymentExpired.java
│
├── payment/
│   ├── Payment.java              ← Aggregate Root
│   ├── PaymentStatus.java        ← Enum: INITIALIZED | SUCCEEDED | FAILED | CANCELED
│   ├── PaymentRepository.java
│   ├── command/
│   │   └── StartPayment.java
│   └── events/
│       ├── PaymentInitialized.java
│       ├── PaymentSucceeded.java
│       ├── PaymentFailed.java
│       └── PaymentCanceled.java
│
├── customer/
│   ├── Customer.java             ← Aggregate Root
│   ├── CustomerRepository.java
│   ├── FullName.java
│   ├── Address.java
│   ├── command/
│   └── event/
│
├── product/
│   ├── Product.java              ← Aggregate Root (inmutable)
│   ├── ProductRepository.java
│   └── query/
│
└── inventory/
    ├── Inventory.java            ← Aggregate Root
    ├── InventoryRepository.java  ← reserve / release / deduct
    ├── command/
    └── events/
        ├── StockReserved.java
        ├── StockReleased.java
        └── StockDeducted.java
```

### Aggregates Root del dominio

| Aggregate     | Responsabilidad principal                                              |
|---------------|------------------------------------------------------------------------|
| `Customer`    | Registro, autenticación y perfil del usuario                           |
| `Order`       | Ciclo de vida completo del pedido con máquina de estados               |
| `Basket`      | Carrito de compras por cliente (add / remove / checkout)               |
| `Product`     | Catálogo de productos con atributos inmutables                         |
| `Inventory`   | Control de stock: `reserve` → `deduct` o `release`                    |
| `Payment`     | Ciclo de pago: `INITIALIZED → SUCCEEDED / FAILED / CANCELED`          |

---

## Capa `application/` — Casos de uso y puertos

> Orquesta el dominio. Conoce el dominio pero **no conoce los adaptadores**.

```
application/
├── usecase/                      ← Puertos primarios (interfaces de entrada)
│   ├── order/
│   │   ├── OrderCreation.java          ← interface
│   │   ├── OrderCancellation.java
│   │   ├── OrderStatusChanging.java
│   │   ├── OrderDisplaying.java
│   │   └── OrderPaymentProcessing.java
│   ├── basket/
│   │   ├── BasketCreation.java
│   │   ├── BasketCheckout.java
│   │   ├── BasketProductHandling.java
│   │   └── BasketDisplaying.java
│   └── payment/
│       ├── PaymentInitialization.java
│       └── PaymentCallbackHandling.java
│
├── service/                      ← Implementaciones (@ApplicationService)
│   ├── order/
│   │   ├── OrderCommandService.java    ← implements OrderCreation, OrderCancellation...
│   │   └── OrderQueryService.java      ← implements OrderDisplaying
│   ├── basket/
│   │   ├── BasketCommandService.java
│   │   └── BasketQueryService.java
│   ├── payment/
│   │   └── PaymentService.java
│   ├── outbox/
│   │   └── OutboxService.java          ← markAsPublished / markAsFailed
│   └── housekeeping/
│       └── outbox/
│           └── OutboxHouseKeepingService.java  ← limpieza @Scheduled
│
├── port/                         ← Puertos secundarios (interfaces de salida)
│   ├── payment/
│   │   └── PaymentGateway.java         ← implementado por Stripe o Mock
│   ├── notification/
│   │   └── Notificator.java            ← implementado por Email o SMS
│   ├── authentication/
│   │   └── Authenticator.java          ← implementado por JWT
│   └── outbox/
│       └── Outbox.java                 ← implementado por JPA
│
└── events/                       ← Listeners del bus de eventos interno
    ├── order/
    │   └── OrderIngestion.java         ← @EventListener: OrderPaid → deduct stock
    └── payment/
        └── PaymentIngestion.java       ← @EventListener: PaymentSucceeded → PAID
```

### Meta-anotación `@ApplicationService`

Todos los servicios de aplicación usan esta anotación personalizada:

```java
@Service
@Transactional(
    propagation = Propagation.REQUIRES_NEW,
    isolation   = Isolation.REPEATABLE_READ
)
public @interface ApplicationService {}
```

Combina `@Service` de Spring con configuración transaccional estricta en una sola anotación semántica.

---

## Capa `adapter/` — Implementaciones concretas

> Es el "exterior" del hexágono. Puede ser reemplazado sin tocar el dominio ni la aplicación.

```
adapter/
├── web/
│   └── rest/                     ← @DriverAdapter — entrada HTTP
│       ├── order/
│       │   └── OrderController.java      ← implements OrdersApi (generado de OpenAPI)
│       ├── basket/
│       │   └── BasketController.java
│       ├── payment/
│       ├── customer/
│       └── product/
│
├── persistence/
│   ├── jpa/                      ← @PersistenceAdapter — Spring Data JPA + PostgreSQL
│   │   ├── order/                ← JpaOrderRepository, entidades JPA, mappers
│   │   ├── basket/
│   │   ├── customer/
│   │   ├── payment/
│   │   ├── product/
│   │   ├── inventory/
│   │   └── outbox/               ← tabla outbox en PostgreSQL
│   └── inmemory/                 ← para tests, sin BD real
│
├── messaging/
│   └── eventbus/rabbit/          ← @DriverAdapter — RabbitMQ
│       ├── RabbitMessagePublisher.java   ← Outbox → RabbitMQ exchange
│       └── RabbitMessageListener.java   ← RabbitMQ → Spring bus interno
│
├── payment/
│   ├── stripe/                   ← implementa PaymentGateway con Stripe SDK
│   └── mock/                     ← implementa PaymentGateway con datos fake
│
├── authentication/
│   └── jwt/                      ← implementa Authenticator con JJWT
│
└── notification/
    ├── email/                    ← implementa Notificator con Spring Mail
    └── sms/                      ← implementa Notificator con SMS
```

### Activación de adaptadores por configuración

Cada adaptador tiene su propia `@Configuration` con `@ConditionalOnProperty`. Se activan desde `application.yml`:

```yaml
adapter:
  persistence:      spring-data-jpa   # o: in-memory
  payment:          stripe             # o: mock
  authentication:   jwt
  notification:     email              # o: sms
  messaging:        spring-event-bus
  web:              rest
```

Esto permite cambiar, por ejemplo, de Stripe a Mock en tests sin modificar una sola línea de código de dominio.

---

## Capa `infrastructure/` — Abstracciones base

> Provee las anotaciones y contratos que usan las demás capas. No importa ninguna otra capa del proyecto.

```
infrastructure/
├── aggregate/
│   └── AggregateRoot.java        ← abstract class con List<DomainEvent>
├── event/
│   ├── DomainEvent.java          ← interfaz base de todos los eventos de dominio
│   ├── Event.java
│   └── Evented.java              ← contrato: events() + clearEvents()
├── adapter/
│   ├── DriverAdapter.java        ← @interface marker para adaptadores de entrada
│   ├── DrivenAdapter.java        ← @interface marker para adaptadores de salida
│   └── PersistenceAdapter.java   ← @interface marker para adaptadores de persistencia
├── application/
│   └── ApplicationService.java   ← meta-anotación @Service + @Transactional
├── command/
│   └── Command.java              ← interfaz marker de comandos
├── query/
│   └── Query.java                ← interfaz marker de consultas
└── modelling/
    └── Modeller.java             ← interfaz base para mappers de dominio
```

---

## Regla de Dependencias

La dependencia solo puede fluir **hacia adentro**. El dominio no conoce a nadie.

```
┌──────────────────────────────────────────────┐
│                  adapter/                     │  ← conoce application
│  ┌───────────────────────────────────────┐   │
│  │             application/              │   │  ← conoce domain
│  │  ┌──────────────────────────────┐    │   │
│  │  │           domain/            │    │   │  ← no conoce a nadie
│  │  └──────────────────────────────┘    │   │
│  └───────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
         infrastructure/ (anotaciones transversales)
```

### Verificación con ArchUnit

Las reglas de dependencia se validan automáticamente en cada `mvn test` mediante **ArchUnit**:

- `domain` no puede importar clases de `application`, `adapter` ni Spring
- `application` no puede importar clases de `adapter`
- Los `adapter` no pueden saltarse la capa `application` para acceder directamente a `domain`
- Cumplimiento de convenciones de nombres y anotaciones (`@DriverAdapter`, `@ApplicationService`, etc.)

```bash
mvn test   # ejecuta unit tests + ArchUnit tests
mvn verify # ejecuta todo lo anterior + integration tests (Testcontainers)
```

---

## Patrón Outbox — Mensajería garantizada

Garantiza que ningún evento de dominio se pierda, incluso si RabbitMQ no está disponible en el momento de la escritura.

```
┌─────────────────────────────────────────────────────┐
│  Transacción de base de datos (atómica)             │
│   1. orders.save(order)          ← guarda el estado │
│   2. outboxes.save(OrderCreated) ← guarda el evento │
└───────────────────────┬─────────────────────────────┘
                        │
             OutboxMessagePublisher
             @Scheduled (job periódico)
                        │
                   RabbitMQ exchange
                        │
             RabbitMessageListener
             @RabbitListener
                        │
             internalBus.publishEvent()    ← Spring ApplicationEventPublisher
                        │
              @EventListener (PaymentIngestion, OrderIngestion...)
```

1. El evento se persiste junto al aggregate en la **misma transacción**.
2. Un job `@Scheduled` publica los mensajes pendientes del Outbox a RabbitMQ.
3. El `RabbitMessageListener` los consume y los re-publica al bus interno de Spring.
4. Los `@EventListener` reaccionan y desencadenan la siguiente acción de negocio.
5. Un `OutboxHouseKeepingService` limpia registros publicados con más de 7 días.

---

## Ciclo de estados de un pedido

```
                    WAITING_FOR_PAYMENT
                           │
              ┌────────────┼────────────┐
              │            │            │
       PAYMENT_FAILED  PAYMENT_CANCELED  PAYMENT_EXPIRED
                                              │
                                        (cancelación automática
                                         + liberación de stock)

         PAID_SUCCESSFULLY  ←──────────────────┘
                │
           PROCESSING  (stock deducido)
                │
            SHIPPED
                │
           DELIVERED
                │
           RETURNED
                │
           REFUNDED
```

Cada transición está validada en `Order.changeStatus()` con el método `status.canTransitionTo(target)`.
Cada cambio de estado genera su propio `DomainEvent` que se propaga por el Outbox.

---

## Módulos Maven

```
oms-backend/
├── pom.xml              ← POM raíz (multi-module)
├── app/
│   └── pom.xml          ← módulo principal (toda la lógica)
└── rest-api-spring-server/
    └── pom.xml          ← módulo generado desde OpenAPI YAMLs
                            (interfaces de controllers y modelos REST)
```

El módulo `rest-api-spring-server` genera las interfaces `OrdersApi`, `BasketsApi`, etc. a partir de los YAML de `/openapi`. Los controllers solo implementan esas interfaces, lo que garantiza que el contrato REST siempre está sincronizado con la especificación.
