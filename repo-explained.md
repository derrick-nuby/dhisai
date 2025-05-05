# DHIS2 AI Assistant Architecture Explained

This document provides a comprehensive overview of the DHIS2 AI Assistant project architecture through visual diagrams.

## 1. High-Level System Architecture

Overview of the main system components and their interactions.

```mermaid
flowchart TB
    subgraph "Frontend Layer"
        UI[React UI Components]
        Hooks[React Hooks]
    end

    subgraph "Next.js Server Layer"
        API[Next.js API Routes]
        Auth[Authentication System]
        Stream[Streaming Interface]
    end

    subgraph "AI Integration Layer"
        LLM[Language Models]
        Tools[AI Tools]
        DataProc[Data Processing]
        StreamPipe[Stream Pipeline]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL Database)]
        Schema[Drizzle ORM Schema]
        Migrations[DB Migrations]
    end

    subgraph "External Systems"
        DHIS2[DHIS2 Instances]
        Auth3rd[OAuth Providers]
    end

    UI <--> Hooks
    Hooks <--> API
    UI <--> API
    API <--> Auth
    API <--> Stream
    Stream <--> StreamPipe
    Stream <--> LLM
    API <--> LLM
    LLM <--> Tools
    LLM <--> DataProc
    Tools <--> DHIS2
    DataProc <--> DB
    API <--> DB
    DB <--> Schema
    Schema <--> Migrations
    Auth <--> Auth3rd
    Auth <--> DB
```

## 2. User Interaction Flow

Sequence diagram showing a user's journey from login to sending a chat message.

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend Components
    participant Auth as Auth System
    participant API as API Routes
    participant DB as Database
    participant AI as AI System
    participant DHIS2 as DHIS2 Instance

    User->>UI: Navigate to login page
    UI->>Auth: Submit credentials
    Auth->>DB: Validate user
    DB-->>Auth: User validated
    Auth-->>UI: Auth token & session
    UI-->>User: Redirect to chat

    User->>UI: Type message
    UI->>API: POST /api/chat with message
    API->>DB: Save user message
    API->>AI: Request LLM response

    alt DHIS2 data needed
        AI->>DHIS2: Query data (with search & ID lookup)
        DHIS2-->>AI: Return health data
    end

    AI-->>API: Stream response chunks
    API-->>UI: Stream response to client
    UI-->>User: Display assistant message
    API->>DB: Save assistant message

    User->>UI: Rate response (upvote/downvote)
    UI->>API: POST /api/vote
    API->>DB: Save user feedback
```

## 3. AI Model Integration with DHIS2

Sequence of how the front end calls the AI service, which queries DHIS2 and returns results.

```mermaid
sequenceDiagram
    participant Client as React Client
    participant API as NextJS API
    participant LLM as AI Model
    participant Tools as AI Tools
    participant DHIS2 as DHIS2 Instances

    Client->>API: User asks about health data
    API->>LLM: Process prompt with streaming

    LLM-->>LLM: Parse natural language intent
    LLM-->>LLM: Determine needed data

    LLM->>Tools: Call dhisRequest tool
    Tools->>DHIS2: GET /api/organisationUnits?query=NAME
    DHIS2-->>Tools: Return org unit IDs

    Tools->>DHIS2: GET /api/indicators?query=NAME
    DHIS2-->>Tools: Return indicator IDs

    Tools->>DHIS2: GET /api/analytics?dimension=dx:ID&dimension=pe:PERIOD&filter=ou:ID
    DHIS2-->>Tools: Return analytics data

    Tools-->>LLM: Parsed DHIS2 data
    LLM-->>LLM: Format response with data
    LLM-->>API: Stream response with visualizations
    API-->>Client: Stream formatted response with charts
```

## 4. Core Application Architecture Overview

Class-style diagram of core classes/modules in the application.

```mermaid
classDiagram
    class ChatSystem {
        +useChat()
        +handleSubmit()
        +appendResponseMessages()
        +createDataStreamResponse()
    }

    class ArtifactManager {
        +createDocument()
        +updateDocument()
        +useArtifact()
        +requestSuggestions()
    }

    class MessageHandler {
        +saveMessages()
        +getMessagesByChatId()
        +deleteTrailingMessages()
        +voteMessage()
    }

    class AIClient {
        +streamText()
        +generateText()
        +smoothStream()
        +getLanguageModel()
    }

    class DHIS2Connector {
        +dhisRequest()
        +listInstances()
        +saveInstance()
        +findResourceIds()
    }

    class AuthManager {
        +signIn()
        +signOut()
        +auth()
        +createUser()
    }

    ChatSystem --> MessageHandler: Uses
    ChatSystem --> AIClient: Requests
    ChatSystem --> ArtifactManager: Creates
    ArtifactManager --> MessageHandler: Stores
    AIClient --> DHIS2Connector: Queries
    AuthManager --> ChatSystem: Authenticates
```

## 5. Component Hierarchy & Data Flow

Flowchart showing how data moves through React components.

```mermaid
flowchart TD
    subgraph "Layout Structure"
        L[app/layout.tsx]
        CL[chat/layout.tsx]
        CP[chat/page.tsx]
        CID[chat/[id]/page.tsx]
    end

    subgraph "Core Components"
        Chat[Chat Component]
        Messages[Messages]
        Artifact[Artifact]
        DSH[DataStreamHandler]
    end

    subgraph "Input & Output"
        MM[MultimodalInput]
        MSG[Message]
        MA[MessageActions]
        PA[PreviewAttachment]
        ME[MessageEditor]
    end

    subgraph "UI Components"
        CH[ChatHeader]
        ST[SidebarToggle]
        MS[ModelSelector]
        VS[VisibilitySelector]
        SA[SuggestedActions]
        MI[MarkdownInterface]
    end

    subgraph "Data Flow"
        useChat[useChat Hook]
        useArtifact[useArtifact Hook]
        API[API Routes]
        DB[(Database)]
    end

    L --> CL
    CL --> CP
    CL --> CID
    CP --> Chat
    CID --> Chat

    Chat --> Messages
    Chat --> Artifact
    Chat --> DSH
    Chat --> MM
    Chat --> CH

    Messages --> MSG
    MSG --> MA
    MSG --> ME

    MM --> PA
    MM --> SA

    CH --> ST
    CH --> MS
    CH --> VS

    Chat --> useChat
    Artifact --> useArtifact
    useChat --> API
    useArtifact --> API
    API --> DB

    DSH --> useChat
    DSH --> useArtifact
```

## 6. Frontend Module Structure

Diagram of pages, layouts, and hooks organization.

```mermaid
flowchart TB
    subgraph "App Directory Structure"
        app[app]
        app_auth[app/(auth)]
        app_chat[app/(chat)]
    end

    subgraph "Auth Pages"
        login[login/page.tsx]
        register[register/page.tsx]
        auth_ts[auth.ts]
        auth_config[auth.config.ts]
        actions[actions.ts]
    end

    subgraph "Chat Pages"
        chat_page[page.tsx]
        chat_id[chat/[id]/page.tsx]
        settings[settings/page.tsx]
        chat_actions[actions.ts]
    end

    subgraph "API Routes"
        api_chat[api/chat/route.ts]
        api_doc[api/document/route.ts]
        api_vote[api/vote/route.ts]
        api_hist[api/history/route.ts]
        api_sugg[api/suggestions/route.ts]
    end

    subgraph "React Hooks"
        useChat[useChat]
        useArtifact[use-artifact.ts]
        useChatVis[use-chat-visibility.ts]
        useMobile[use-mobile.tsx]
        useScrollBot[use-scroll-to-bottom.ts]
    end

    app --> app_auth
    app --> app_chat

    app_auth --> login
    app_auth --> register
    app_auth --> auth_ts
    app_auth --> auth_config
    app_auth --> actions

    app_chat --> chat_page
    app_chat --> chat_id
    app_chat --> settings
    app_chat --> chat_actions
    app_chat --> api_chat
    app_chat --> api_doc
    app_chat --> api_vote
    app_chat --> api_hist
    app_chat --> api_sugg

    chat_page -.-> useChat
    chat_id -.-> useChat
    chat_id -.-> useArtifact

    useChat -.-> useChatVis
    useChat -.-> useScrollBot
    useArtifact -.-> useMobile
```

## 7. Chat System & API Sequence

Sequence diagram of a chat message from client → Next.js API → AI service → response.

```mermaid
sequenceDiagram
    participant Client as React Client
    participant Chat as Chat Component
    participant API as api/chat/route.ts
    participant DB as Database
    participant LLM as Language Model
    participant Stream as Stream Handler

    Client->>Chat: User submits message
    Chat->>API: POST /api/chat (id, messages, model)

    API->>DB: Check if chat exists (getChatById)

    alt Chat doesn't exist
        API->>LLM: Generate title from user message
        API->>DB: Create new chat (saveChat)
    end

    API->>DB: Save user message (saveMessages)

    API->>Stream: Create data stream response
    Stream->>LLM: Start streamText with system prompt

    LLM-->>LLM: Process with tools access

    loop For each response chunk
        LLM-->>Stream: Send text chunk
        Stream-->>API: Add to stream
        API-->>Client: Stream chunk to UI
    end

    LLM->>Stream: Complete response
    API->>DB: Save assistant message

    Client->>Chat: Show complete response
    Chat->>Client: Enable voting, editing
```

## 8. Database Schema (ER Diagram)

Entities and relationships as a Mermaid entity-relationship diagram.

```mermaid
erDiagram
    User {
        uuid id PK
        varchar email
        varchar password
    }

    Chat {
        uuid id PK
        timestamp createdAt
        text title
        uuid userId FK
        varchar visibility
    }

    Message {
        uuid id PK
        uuid chatId FK
        varchar role
        json parts
        json attachments
        timestamp createdAt
    }

    Vote {
        uuid chatId FK
        uuid messageId FK
        boolean isUpvoted
    }

    Document {
        uuid id PK
        timestamp createdAt
        text title
        text content
        varchar kind
        uuid userId FK
    }

    Suggestion {
        uuid id PK
        uuid documentId FK
        timestamp documentCreatedAt
        text originalText
        text suggestedText
        text description
        boolean isResolved
        uuid userId FK
        timestamp createdAt
    }

    Instance {
        uuid id PK
        text name
        text url
        text apiToken
        text description
        text username
        text password
        json details
        boolean verified
        uuid userId FK
        timestamp createdAt
        timestamp updatedAt
    }

    User ||--o{ Chat : "creates"
    User ||--o{ Document : "owns"
    User ||--o{ Suggestion : "receives"
    User ||--o{ Instance : "configures"

    Chat ||--o{ Message : "contains"
    Chat ||--o{ Vote : "receives"

    Message ||--o{ Vote : "gets voted on"

    Document ||--o{ Suggestion : "has improvements"
```

## 9. DHIS2 Integration Flow

Flow of data between the backend and DHIS2 instance.

```mermaid
flowchart TB
    subgraph "DHIS2 AI Assistant App"
        UI[User Interface]
        API[NextJS API]
        Tools[AI Tools]
        LLM[Language Model]
    end

    subgraph "DHIS2 Instance"
        Auth[Authentication API]
        Meta[Metadata API]
        Analytics[Analytics API]
        Data[Data API]
    end

    subgraph "Integration Path"
        Config[Instance Configuration]
        Token[API Token Storage]
        Inst[Instance Management]
    end

    UI --> |1. User queries health data| API
    API --> |2. Process request| LLM
    LLM --> |3. Detect DHIS2 query need| Tools

    Tools --> |4a. Lookup instance details| Inst
    Inst --> |4b. Get credentials| Token
    Tools --> |5. Auth with token| Auth
    Auth --> |6. JWT/Session| Tools

    Tools --> |7a. Search resources| Meta
    Meta --> |7b. Return resource IDs| Tools

    Tools --> |8a. Request analytics with IDs| Analytics
    Analytics --> |8b. Return aggregated data| Tools

    Tools --> |9a. Optional: fetch raw data| Data
    Data --> |9b. Return detailed records| Tools

    Tools --> |10. Process & format data| LLM
    LLM --> |11. Generate human-friendly response| API
    API --> |12. Stream response with visualizations| UI
```

## 10. Authentication System Sequence

Sequence of login or registration flow.

```mermaid
sequenceDiagram
    actor User
    participant Client as React Client
    participant Auth as AuthForm Component
    participant Action as Server Action
    participant NextAuth as NextAuth.js
    participant DB as Database
    participant Cookie as Cookie Store

    User->>Client: Navigate to /login or /register
    Client->>Auth: Display auth form

    alt Register Flow
        User->>Auth: Enter email, password
        Auth->>Action: Call register() server action
        Action->>DB: Check if user exists

        alt User Exists
            DB-->>Action: User found
            Action-->>Auth: Status: user_exists
            Auth-->>User: Show error message
        else User Does Not Exist
            Action->>Action: Hash password with bcrypt
            Action->>DB: Create new user
            DB-->>Action: User created
            Action->>NextAuth: Sign in with new credentials
        end
    else Login Flow
        User->>Auth: Enter email, password
        Auth->>Action: Call login() server action
        Action->>NextAuth: Call signIn("credentials")
        NextAuth->>DB: Validate credentials

        alt Valid Credentials
            DB-->>NextAuth: User validated
            NextAuth->>Cookie: Set auth session cookie
            NextAuth-->>Action: Status: success
            Action-->>Auth: Redirect to /
        else Invalid Credentials
            DB-->>NextAuth: Invalid credentials
            NextAuth-->>Action: Status: failed
            Action-->>Auth: Show error message
        end
    end

    Client->>Client: Check auth state
    Client->>User: Show authenticated UI
```

## 11. Deployment & Infrastructure

Diagram of hosting, CI/CD, and environment configuration.

```mermaid
flowchart TB
    subgraph "Development Environment"
        Dev[Developer Workstation]
        Git[Git Repository]
        NPM[pnpm/npm]
    end

    subgraph "CI/CD Pipeline"
        Push[Git Push]
        GHA[GitHub Actions]
        Build[Build Process]
        Test[Tests]
        Lint[Linting]
        Deploy[Deployment]
    end

    subgraph "Production Infrastructure"
        Vercel[Vercel Platform]
        NextJS[Next.js Runtime]
        EdgeFn[Edge Functions]
        PSQL[PostgreSQL Database]
    end

    subgraph "External Services"
        DHIS2[DHIS2 Instances]
        AI[AI Model Provider]
    end

    subgraph "Configuration"
        Env[Environment Variables]
        Settings[App Configuration]
    end

    Dev -->|Local development| NPM
    NPM -->|Install dependencies| Dev
    Dev -->|Commit changes| Git

    Git -->|Trigger CI| Push
    Push -->|Start workflow| GHA
    GHA -->|Run build| Build
    GHA -->|Run tests| Test
    GHA -->|Check code quality| Lint
    GHA -->|Deploy if checks pass| Deploy

    Deploy -->|Deploy to| Vercel
    Vercel -->|Run| NextJS
    Vercel -->|Stream via| EdgeFn
    Vercel -->|Connect to| PSQL

    NextJS -->|Call| AI
    NextJS -->|Query| DHIS2

    Env -->|Configure| NextJS
    Env -->|Secrets for| AI
    Env -->|Connection to| PSQL
    Settings -->|Instance settings| DHIS2
```

## 12. Message Processing Pipeline

Sequence showing how an incoming message is parsed, streamed, and rendered.

```mermaid
sequenceDiagram
    participant User
    participant Input as MultimodalInput
    participant Chat as Chat Component
    participant API as NextJS API
    participant Stream as Stream Handler
    participant LLM as Language Model
    participant UI as UI Components

    User->>Input: Type message
    Input->>Chat: handleSubmit(input)
    Chat->>API: POST /api/chat

    API->>Stream: Create data stream
    Stream->>LLM: Process with system prompt

    LLM->>LLM: Parse user query
    LLM->>LLM: Generate response

    loop For each text chunk
        LLM-->>Stream: Generate text chunk
        Stream-->>Stream: Transform with smoothStream
        Stream-->>API: Add to stream
        API-->>Chat: Send chunk via SSE
        Chat-->>UI: Update UI with new text
        UI-->>User: Display incremental text
    end

    alt When artifacts detected
        LLM->>Stream: Signal artifact creation
        Stream->>Stream: Call createDocument tool
        Stream->>API: Create document object
        API->>Chat: Signal artifact creation
        Chat->>UI: Display artifact (code/image/sheet)
    end

    alt When reasoning available
        LLM->>Stream: Include reasoning
        Stream->>API: Add reasoning
        API->>Chat: Deliver reasoning
        Chat->>UI: Show reasoning toggle
        User->>UI: Click to view reasoning
    end

    API->>API: Save message to database
    API-->>Chat: Signal completion
    Chat-->>User: Enable interaction (vote, edit)
```

## 13. API Client-Side Components Data Flow

Flow of data from hooks → API calls → components.

```mermaid
flowchart LR
    subgraph "React Hooks"
        useChat[useChat]
        useArtifact[useArtifact]
        useChatVis[useChatVisibility]
        useSWR[useSWR]
    end

    subgraph "API Client Functions"
        fetcher[fetcher]
        POST[POST requests]
        GET[GET requests]
        PATCH[PATCH requests]
        DELETE[DELETE requests]
    end

    subgraph "API Routes"
        chat[/api/chat]
        document[/api/document]
        vote[/api/vote]
        history[/api/history]
        suggestion[/api/suggestions]
    end

    subgraph "UI Components"
        Chat[Chat]
        Messages[Messages]
        Message[Message]
        Artifact[Artifact]
        SidebarHistory[SidebarHistory]
        Actions[MessageActions]
    end

    useChat --> POST
    useChat --> Chat
    useChat --> Messages

    useArtifact --> POST
    useArtifact --> GET
    useArtifact --> Artifact

    useChatVis --> PATCH
    useChatVis --> Chat

    useSWR --> fetcher
    useSWR --> GET
    useSWR --> SidebarHistory
    useSWR --> Actions

    POST --> chat
    POST --> document
    PATCH --> vote
    GET --> history
    GET --> document
    GET --> vote
    GET --> suggestion
    DELETE --> chat
    DELETE --> document

    chat --> Chat
    document --> Artifact
    vote --> Actions
    history --> SidebarHistory
    suggestion --> Artifact

    Chat --> Message
    Messages --> Message
```

## 14. Model Inference Process

Diagram of how requests are batched, sent to the AI model, and streamed back.

```mermaid
sequenceDiagram
    participant Client as Client Browser
    participant API as NextJS API
    participant Queue as Request Handler
    participant AI as AI Client
    participant LLM as Language Model
    participant Stream as Response Stream

    Client->>API: Submit user message
    API->>Queue: Process request

    Queue->>AI: Call streamText()
    AI->>AI: Prepare system prompt
    AI->>AI: Add user messages
    AI->>AI: Configure tools

    AI->>LLM: Send request to model

    LLM->>LLM: Process input with context

    loop Token Generation
        LLM-->>AI: Generate token
        AI-->>AI: Apply smoothStream transform

        alt Is Tool Call
            LLM-->>AI: Detect tool usage
            AI->>AI: Execute tool function
            AI->>LLM: Return tool result
        else Is Regular Text
            AI-->>Stream: Add token to stream
        end

        Stream-->>API: Stream chunk to client
        API-->>Client: Server-sent event with chunk
        Client-->>Client: Update UI incrementally
    end

    LLM-->>AI: Complete generation
    AI-->>Stream: Finish response
    Stream-->>API: Close stream
    API-->>Client: Complete response
    API->>API: Save to database
```

## 15. Data Storage & Retrieval Flow

End-to-end flow of saving a new artifact or message to the database and fetching it.

```mermaid
flowchart TD
    subgraph "User Interaction"
        UserMsg[User sends message]
        AIResp[AI responds]
        UserArt[User creates artifact]
    end

    subgraph "Frontend Components"
        Chat[Chat component]
        Artifact[Artifact component]
        DSH[DataStreamHandler]
    end

    subgraph "Hooks & State"
        useChat[useChat hook]
        useArtifact[useArtifact hook]
        ChatState[Chat state]
        ArtState[Artifact state]
    end

    subgraph "API Layer"
        ChatAPI[/api/chat]
        DocAPI[/api/document]
        HistAPI[/api/history]
    end

    subgraph "Server Logic"
        SaveMsg[saveMessages]
        SaveDoc[saveDocument]
        GetMsg[getMessagesByChatId]
        GetDoc[getDocumentsById]
    end

    subgraph "Database"
        MsgDB[(Message Table)]
        DocDB[(Document Table)]
        ChatDB[(Chat Table)]
    end

    %% Creation flow
    UserMsg --> Chat
    Chat --> useChat
    useChat --> ChatAPI
    ChatAPI --> SaveMsg
    SaveMsg --> MsgDB

    AIResp --> DSH
    DSH --> useArtifact
    useArtifact --> DocAPI
    DocAPI --> SaveDoc
    SaveDoc --> DocDB

    UserArt --> Artifact
    Artifact --> useArtifact

    %% Retrieval flow
    Chat --> HistAPI
    HistAPI --> ChatDB
    ChatDB --> ChatState

    ChatState --> useChat
    useChat --> GetMsg
    GetMsg --> MsgDB
    MsgDB --> Chat

    ArtState --> useArtifact
    useArtifact --> GetDoc
    GetDoc --> DocDB
    DocDB --> Artifact
```
