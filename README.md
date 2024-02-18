# Ionic Angular CRMs - Peronal R&D Second Iteration

Hi! This is the second iteration of R&D on architectures for Angular CRMs applications.
You can find the first iteration [here](https://github.com/riccardoFasan/angular-crm-concept).

### Key concepts of this architecture

- UI and domain logic decoupling
- State management using signals (I suggest you to visit Joshua Morony [channel](https://www.youtube.com/@JoshuaMorony/) to understand the benefits of signals and how to use them)
- Smart and Dumb components
- Nx-like folder structure (I found a usefull inspiration in this [article](https://dev.to/mfp22/why-your-folder-structure-sucks-2jb4))
- Intermediation between CRUD APIs services and client classes using facades
- Angular new stuff: signals, signal inputs, standalone components, "@" template syntax and many more

### The Application

This app is a food diary divided in five pages, any of this page is a scrollable list and any item of the list has a detail modal with a form (yeah: a boring CRM) .

Explore the codebase for more details. Starting from ListStoreService class, DetailStoreService class and StoreHandler interface di reccomanded.
