# Ionic Angular CRMs - Personal R&D Second Iteration

Hi! This is the second iteration of R&D on architectures for Angular CRM applications.
You can find the first iteration [here](https://github.com/riccardoFasan/angular-crm-concept).

### Key Concepts of this Architecture

- Decoupling of UI and domain logic
- State management using signals (I recommend visiting Joshua Morony's [channel](https://www.youtube.com/@JoshuaMorony/) to understand the benefits of signals and how to use them)
- Smart and Dumb components
- Nx-like folder structure (I found useful inspiration in this [article](https://dev.to/mfp22/why-your-folder-structure-sucks-2jb4))
- Intermediation between CRUD API services and client classes using facades
- New Angular features: signals, signal inputs, standalone components, "@" template syntax, and more

### The Application

This application is a food diary divided into five pages. Each page is a scrollable list, and each item on the list has a detail modal with a form (yes, it's a typical CRM).

Explore the codebase for more details. I recommend starting with the ListStoreService class, DetailStoreService class, and the StoreHandler interface.
