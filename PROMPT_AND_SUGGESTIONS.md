
# Refined Prompt & UX Architecture

Below is the highly detailed prompt you should use if you were to ask an AI to rebuild this application from scratch. It captures all the advanced features, logic, and UI details we have implemented.

## 1. The "Master Prompt" for AI Generation

> **Role:** Expert Senior Frontend Engineer & UX Designer.
> **Task:** Build "LifeSync," a high-performance React application serving as a hybrid Time-Blocked Planner, Diary, and Productivity Coach.
>
> **Tech Stack:**
> *   **Framework:** React 19 (Functional Components, Hooks).
> *   **Styling:** Tailwind CSS (Dark Mode support, Zinc/Neutral palette).
> *   **Icons:** Lucide-React.
> *   **Charts:** Recharts.
> *   **Backend/Auth:** Firebase v9 (Auth, Analytics).
> *   **AI:** Google Gemini API (`@google/genai`) for generating daily insights.
> *   **Date Management:** date-fns.
>
> **Core Layout:**
> *   **Split-Screen Design:**
>     *   **Left Panel (The Timeline):** A scrollable vertical timeline (05:00 - 05:00 next day).
>         *   *Header:* Date picker (Year/Month/Day drill-down), Day navigation.
>         *   *Visualization:* Tasks rendered as absolute-positioned blocks. Height = duration.
>         *   *Interactivity:* Click to Edit, specific visual styles for "Completed" vs "Pending" tasks.
>         *   *Dynamic Time Indicator:* A red line showing the current time.
>     *   **Right Panel (The Dashboard):** A modular grid of cards and charts.
>         *   *Top Bar:* AI Coach button (Sparkles icon), Settings, Category Manager.
>         *   *Analytics Section:*
>             *   **Key Metrics:** Deep Focus Hours, Total Time, Completion %, Average Mood (1-5 scale).
>             *   **Activity Distribution:** Stacked Bar Chart (Recharts) showing Completed vs. Pending hours per category.
>             *   **Top Activities:** A ranked list of most time-consuming categories.
>         *   *Week-at-a-Glance:* A 7-day strip showing completion dots, mood emojis, and mini-lists of tasks for each day.
>
> **Key Features & Logic:**
> 1.  **Smart Categories:**
>     *   User can Create/Edit/Delete categories.
>     *   Properties: Name, Color (Hex), Icon (Lucide name), "Focus" boolean (determines if it counts toward Deep Work stats).
> 2.  **AI Insight Generation:**
>     *   Use `gemini-3-flash-preview` to analyze the day's tasks and the user's reflection log.
>     *   Output a motivating summary and productivity tip.
> 3.  **Authentication (Firebase):**
>     *   Support Google Sign-In and Email/Password.
>     *   **Crucial:** Handle `auth/unauthorized-domain` errors gracefully with a user-friendly UI alert.
> 4.  **Reflections:**
>     *   "End Day" modal to log a Mood Score (1-5) and a text reflection.
> 5.  **Themes:**
>     *   Support Light/Dark mode toggles.
>     *   Support "Accent Color" themes (Red, Blue, Emerald, etc.) that update buttons, rings, and active states globally.
>
> **Visual Style:**
> *   Clean, "Linear-like" aesthetic.
> *   Heavy use of subtle borders (`border-zinc-800`), backdrop blurs, and rounded corners (`rounded-2xl`).
> *   Dense but readable typography (Inter font).

## 2. UX & Error Handling Improvements (Implemented)

### Authentication
*   **Problem:** Users often forget to whitelist their domain in Firebase.
*   **Solution:** The `AuthModal` now specifically listens for `auth/unauthorized-domain`. If caught, it displays a high-visibility red alert box with instructions on how to fix it in the Firebase Console.

### Data Visualization
*   **Problem:** Standard tooltips cover important data.
*   **Solution:** Custom Recharts tooltip that shows "Total," "Done," and "Pending" hours with color-coded indicators.

### Task Management
*   **Collision Handling:** Tasks overlapping in time dynamically calculate their `left` and `width` CSS properties to prevent visual overlap on the timeline.
