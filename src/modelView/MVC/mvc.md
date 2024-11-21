## Model-View-Controller


### Key Concepts of MVC


| Component      | Responsibility                                                                                 | MobX Equivalent            |
| -------------- | ---------------------------------------------------------------------------------------------- | -------------------------- |
| **Model**      | Manages data, business logic, and application state. Provides APIs for interacting with data.  | Observable stores in MobX. |
| **View**       | Displays data to the user and captures user interactions.                                      | React components.          |
| **Controller** | Intermediary between Model and View. Orchestrates changes and binds user interactions to data. | Actions in MobX.           |



The **Model-View-Controller (MVC)** pattern is a software architectural pattern that promotes the separation of concerns. It divides an application into three interconnected components:

* **Model**: Handles the data, business logic, and state.
* **View**: Manages the presentation layer and user interface.
* **Controller**: Acts as the intermediary, processing input from the View and updating the Model or View.
