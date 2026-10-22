Create a Frontend-Only Product Requirements Document (PRD) for the following app idea:

Service Desk - A single-page application for managing support tickets.

IMPORTANT: This PRD is for FRONTEND ONLY. Do NOT include backend server setup or database configurations. Focus on UI and API integration.

1. **Product Overview**
   - Product name: Simple Service Desk
   - Description: A single-page app to view, create, update, and filter support tickets.

2. **User Stories**
   - As a user, I want to see all tickets loaded from the real backend API so that I know what tasks exist.
   - As a user, I want to create a new ticket with a title and priority so that I can report an issue.
   - As a user, I want to change the status of any ticket and have it save to the backend so the progress is tracked.
   - As a user, I want to filter tickets by status (all, open, doing, done) so I can focus on specific tasks.
   - As a user, I want to see error messages or empty states if there is no data or an API error occurs.

3. **Screen/Page Definitions**
   - **Main Dashboard (Single Page)**
     - A form at the top to create a new ticket.
     - A filter control (buttons or dropdown) to select the status filter (All, Open, Doing, Done).
     - A list or grid displaying ticket cards.

4. **UI Component Specifications**
   - **Ticket Card/Row:** Displays `id`, `title`, `priority` (low, medium, high), and a control to change `status` (open, doing, done).
   - **Creation Form:** 
     - Text input for `title` (needs to handle 1-80 chars).
     - Select/Radio for `priority` (low, medium, high).
     - Submit button.
   - **Feedback UI:** Loading spinners, error messages, and "No tickets found" empty states.
   - **Design:** Clean, readable, uses standard Thai or English text.

5. **User Interaction Flows**
   - **Loading (A1):** On page load, fetch tickets from the backend. Display them. Do not use mock data as the primary source.
   - **Creating (A2):** User fills title and priority, clicks submit. UI calls POST API. On success, UI refreshes the list or appends the new ticket. Show error if submission fails.
   - **Updating Status (A3):** User changes status on a ticket card. UI calls PATCH/PUT API. UI updates immediately. Changes persist on page refresh.
   - **Filtering (A4):** User clicks a filter tab. The displayed list updates to show only matching tickets (can be done client-side or via API query).

6. **Data Contract (For API Integration)**
   - Ticket Object Structure:
     `{"id": 1, "title": "Printer offline", "priority": "high", "status": "open"}`