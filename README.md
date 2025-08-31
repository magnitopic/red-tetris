# 🎮 Red Tetris - Multiplayer Tetris Game

A modern, real-time multiplayer Tetris game built with cutting-edge web technologies. Play solo or compete with friends in synchronized multiplayer matches.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 🌟 Features

### 🎯 Core Gameplay
- **Classic Tetris Mechanics**: Authentic piece movement, rotation, and line clearing
- **Real-time Multiplayer**: Synchronized gameplay with multiple players
- **Room-based Matches**: Create or join game rooms with friends
- **Spectator Mode**: Watch ongoing games when joining in progress
- **Dynamic Difficulty**: Speed increases as the game progresses

### 🔐 User Management
- **OAuth Integration**: Login with GitHub, Google, 42, and Twitch
- **User Profiles**: Customizable profiles with scores tracking
- **Profile Pictures**: Upload and manage custom avatars

### 🚀 Real-time Features
- **WebSocket Communication**: Instant game state synchronization
- **Live Game Updates**: See opponents' moves in real-time
- **Room Management**: Host controls, player management, and dynamic host switching
- **Connection Handling**: Robust reconnection and error handling

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop and mobile devices
- **Smooth Animations**: Fluid piece movements and transitions
- **Accessibility**: Keyboard navigation and screen reader support

## 🛠 Technology Stack

### Backend
- **Node.js + Express**: RESTful API and server infrastructure
- **Socket.io**: Real-time bidirectional communication
- **PostgreSQL**: Robust data persistence and user management
- **JWT Authentication**: Secure token-based authentication
- **OAuth 2.0**: Third-party authentication integration
- **Jest**: Comprehensive testing with 70%+ coverage

### Frontend
- **React 18**: Modern component-based UI framework
- **TypeScript**: Type-safe development experience
- **Vite**: Lightning-fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Efficient data fetching and caching
- **React Testing Library**: Component testing framework

### DevOps & Infrastructure
- **Docker**: Containerized development and deployment
- **Docker Compose**: Multi-service orchestration with custom volumes
- **Makefile**: Streamlined development workflow and automation
- **PostgreSQL**: Dockerized database with initialization scripts
- **Environment Configuration**: Flexible configuration management

## 📁 Project Structure

```
red-tetris/
├── Backend/                 # Node.js API Server
│   ├── src/
│   │   ├── Controllers/     # Request handlers
│   │   ├── Core/           # Application core (App, GameServer, Model)
│   │   ├── Game/           # Game logic (Board, Pieces, Player)
│   │   ├── Middlewares/    # Express middlewares
│   │   ├── Models/         # Database models
│   │   ├── Routes/         # API route definitions
│   │   └── Utils/          # Utility functions
│   └── test/               # Comprehensive test suite
├── Frontend/               # React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API communication
│   │   └── utils/          # Utility functions
│   └── __tests__/          # Frontend tests
└── Docker/                 # Container configurations
```

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Make (for simplified commands)
- Node.js 18+ (for local development)

### Quick Start with Make

1. **Clone the repository**
   ```bash
   git clone https://github.com/magnitopic/red-tetris.git
   cd red-tetris
   ```

2. **Environment Setup**
   ```bash
   # Copy .env-example into .env
   cp .env-example .env
   # Edit .env with your credentials
   ```

3. **Launch the complete application**
   ```bash
   make build    # Builds and starts all containers
   # or simply
   make         # Default target is build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Available Make Commands

#### **Container Management**
- `make build` - Build and start all containers
- `make restart` - Restart all containers
- `make stop` - Stop all containers
- `make down` - Stop and remove containers
- `make fclean` - Complete cleanup (containers, images, node_modules)

#### **Individual Services**
- `make frontend` - Start only frontend container
- `make backend` - Start only backend container
- `make postgresql` - Start only database container

#### **Testing**
- `make test-backend` - Run all backend tests
- `make test-backend-cov` - Backend tests with coverage report
- `make test-frontend` - Run all frontend tests
- `make test-frontend-cov` - Frontend tests with coverage report
- `make test-backend-file FILE=filename.test.js` - Run specific test file

#### **Data Management**
- `make remove_data` - Remove persistent data (uploads, database)
- `make re` - Complete rebuild (fclean + build)

### Local Development Setup

For development without Docker:

1. **Backend Development**
   ```bash
   cd Backend
   npm install
   npm run dev        # Development server with hot reload
   make test-backend-cov  # Run tests using make
   ```

2. **Frontend Development**
   ```bash
   cd Frontend
   npm install
   npm run dev       # Development server with hot reload
   make test-frontend-cov # Run tests using make
   ```

## 🎮 How to Play

1. **Authentication**: Sign in using your preferred OAuth provider or by username-password
2. **Create/Join Room**: Start a new game or join an existing room
3. **Game Controls**:
   - `←/→`: Move pieces left/right
   - `↓`: Soft drop
   - `Space`: Hard drop
   - `↑`: Rotate piece
4. **Multiplayer**: Compete with other players in real-time
5. **Spectate**: Watch other players ongoing games

## 🏗 Architecture Highlights

### Real-time Game Engine
- **Deterministic Gameplay**: Seed-based random generation ensures fair play
- **State Synchronization**: Efficient game state broadcasting
- **Collision Detection**: Optimized piece placement validation

### Scalable Backend Architecture
- **Modular Design**: Clean separation of concerns
- **Middleware Pipeline**: Extensible request processing
- **Database Abstraction**: Flexible data layer with transaction support
- **Session Management**: Secure user session handling

### Modern Frontend Patterns
- **Component Composition**: Reusable and testable UI components
- **Custom Hooks**: Encapsulated business logic
- **State Management**: Efficient global state handling
- **Error Boundaries**: Graceful error handling and recovery

## 🧪 Testing & Quality

- **Backend**: 70%+ test coverage with Jest
- **Frontend**: Component and integration testing with React Testing Library
- **Automated Testing**: Make commands for easy test execution
- **Coverage Reports**: Detailed coverage analysis for both frontend and backend
- **File-specific Testing**: Run individual test files for targeted debugging
- **Code Quality**: ESLint, Prettier, and TypeScript enforcement
- **CI/CD Ready**: Automated testing and deployment pipelines

## 🔧 Configuration

### OAuth Setup
Configure your OAuth applications and add credentials to `.env`:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Add other providers as needed
```

### Database Configuration
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=red_tetris
DB_USER=your_db_user
DB_PASS=your_db_password
```

## 📈 Performance Features

- **WebSocket Optimization**: Efficient real-time communication
- **Database Indexing**: Optimized query performance
- **Caching Strategies**: Session and data caching
- **Code Splitting**: Lazy-loaded frontend components
- **Image Optimization**: Efficient asset delivery


## 🎯 Portfolio Highlights

This project demonstrates:

- **Full-Stack Development**: Complete CRUD operations with real-time features
- **Modern JavaScript/TypeScript**: ES6+, async/await, modern React patterns
- **Real-time Systems**: WebSocket implementation and state synchronization
- **Database Design**: Relational database modeling and optimization
- **Testing Excellence**: Comprehensive test coverage and quality assurance
- **DevOps Skills**: Containerization, environment management, and deployment
- **Build Automation**: Makefile-driven development workflow and CI/CD pipeline
- **UI/UX Design**: Responsive design and user experience optimization
- **Security Best Practices**: OAuth integration, JWT tokens, and secure sessions

---

**Made with ❤️ by alaparic & adiaz-uf** - *Showcasing modern web development skills*