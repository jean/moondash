---
layout: page
title:  "Building the mocking module"
---

# Building the mocking module

Moondash has a component ``src/mockapi`` which makes it convenient for 
sitedevs to make an in-browser REST API.

## Notes

- Uses AngularJS's ``ngMockE2E``

- We currently have an ugly way of registering in ``module.js``

- A provider allows config-time registration of mocks from client code

- Then, when a request comes in, it looks for any matching mocks and 
runs the registered handler

- If nothing matches, it passes through and doesn't use ``ngMockE2E``