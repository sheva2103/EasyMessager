<!-- # 💬 EasyMessager

**EasyMessager** — это современное веб-приложение для звонков и обмена сообщениями в реальном времени. Проект создан с фокусом на производительность, типизацию и кастомную конфигурацию сборки.

## 🔗 Ссылки
* **[Живое демо (Deploy)](https://eazymessager.web.app)** — *попробуйте приложение в действии!*
> **Тестовый аккаунт для входа:**
> * **Email:** `t@test.com`
> * **Password:** `qwerty12`

## 🚀 Основные возможности

### 📞 Коммуникации
* **WebRTC Voice сalls:** Реализована система P2P звонков с обработкой медиа-потоков.
* **Real-time Messaging:** Мгновенный обмен сообщениями между пользователями.
* **User Presence System:** Индикация онлайн-статуса пользователей в реальном времени.

### 💬 Сообщения и интерактив
* **Статусы сообщений:** Индикация прочтения и доставки.
* **Реакции:** Возможность оставлять эмодзи-реакции на сообщения.
* **Forward & Reply:** Функционал пересылки сообщений в другие чаты и ответов на конкретные реплики.
* **Черный список:** Система блокировки пользователей (игнорирование входящих событий от заблокированных контактов).

### 👥 Групповые чаты
* **Типы групп:** Создание публичных (открытых) и приватных (закрытых) сообществ.
* **Управление участниками:** Система добавления пользователей и модерации доступа.

### 🛠 Инженерные решения
* **Custom Webpack:** Ручная настройка сборки, ts-loader и TypeScript для полного контроля над бандлом.
* **State Management:** Сложная логика управления состоянием для синхронизации чатов и звонков.

## 🛠 Технологический стек
* **Frontend:** React 18, TypeScript.
* **State Management:** Redux Toolkit.
* **Styling:** SCSS.
* **Backend/DB:** Firebase (Firestore & Auth).
* **Build Tools:** Webpack, ts-loader, ESLint.
**Security:** Использование `.env` для защиты API-ключей.

## 🏗 Архитектура проекта
В проекте реализовано четкое разделение ответственности:
* `src/components` — переиспользуемые UI-компоненты.
* `src/hooks` — кастомные хуки для работы с API и логикой.
* `config/build` — конфигурация сборки для различных сред (Dev/Prod).

## 🔧 Установка и запуск

1. **Клонируйте репозиторий:** Приложение использует Firebase. Для запуска создайте файл .env на основе .env.example и добавьте свои API ключи.
   ```bash
   git clone [https://github.com/sheva2103/EasyMessager.git](https://github.com/sheva2103/EasyMessager.git) -->



# 💬 EasyMessenger

**EasyMessenger** is a modern web application for real-time messaging and voice calls. The project is built with a focus on performance, strict typing, and custom build configurations.

## 🔗 Links
* **[Live Demo](https://easymessenger-app.web.app/)** — *Try the app in action!*
> **Test Account Credentials:**
> * **Email:** `test@test.com`
> * **Password:** `qwerty12`

## 🚀 Key Features

### 📞 Communications
* **WebRTC Voice Calls:** P2P calling system with media stream processing.
* **Real-time Messaging:** Instant exchange of messages between users.
* **User Presence System:** Real-time online/offline status indicators.

### 💬 Messaging & Interactivity
* **Message Statuses:** Read and delivery indicators.
* **Reactions:** Ability to leave emoji reactions on messages.
* **Forward & Reply:** Functionality to forward messages to other chats and reply to specific messages.
* **Blacklist:** User blocking system (ignores incoming events from blocked contacts).

### 👥 Group System
* **Group Types:** Support for both public (open) and private (closed) communities.
* **Member Management:** System for adding users and moderating access.

### 🛠 Engineering Solutions
* **Custom Webpack:** Manual build configuration with `ts-loader` and TypeScript for full control over the bundle.
* **State Management:** Complex state logic to synchronize chats and calls seamlessly.

## 🛠 Tech Stack
* **Frontend:** React 18, TypeScript.
* **State Management:** Redux Toolkit.
* **Styling:** SCSS.
* **Backend/DB:** Firebase (Firestore & Auth).
* **Build Tools:** Webpack, ts-loader, ESLint.
* **Security:** Use of `.env` files to protect API keys.

## 🏗 Project Architecture
The project follows a clear separation of concerns:
* `src/components` — Reusable UI components.
* `src/hooks` — Custom hooks for API interaction and business logic.
* `config/build` — Build configurations for different environments (Dev/Prod).

## 🔧 Installation & Setup

1. **Clone the repository:**
   Clone the repository
   ```bash
   git clone https://github.com/sheva2103/easy-messenger.git

2. **Install dependencies:**
   Run the following command to download all necessary packages:
   ```bash
   npm install

3. **Setup Environment Variables:**
   Create a .env file in the root directory of the project. Copy the content from .env.example and insert your own Firebase configuration keys (API Key, Auth Domain, Project ID, etc.).
   

4. **Run the application::**
   To start the development server
   ```bash
   npm run start


5. **Install dependencies:**
   To create an optimized production bundle:
   ```bash
   npm run build:prod