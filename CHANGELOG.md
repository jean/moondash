# Changelog

## Unreleased

- Use partialify to include template strings from files. Remove all 
machinery from gulp-angular-templatecache and gulp task. Stop including
moonshot-templates.js in the demos.

## 0.0.5-alpha (2014-12-26)

- Forms and schemas now come from siteconfig.json (server-side)

- Provide ``md-init`` directive as an attribute that can point to the 
URL of a JSON file that bootstraps everything.

- Stop storing menu data on the configuration. Instead, each plugin 
 (e.g. src/nav) will have a service that manages its configuration.

- Resource types

    * Start src/resourcetypes plugin
    
    * Nav menu to list the known types, as well as menuitem to manage 
    them
    
    * Start MdRTypes service, add a helper for registering a type and 
    adding to the navmenu.
    
    * Move sample stuff to demos/full
    
    * Start of declarative siteconfig.json in demo
    
    * Put information about rtypes into siteconfig
    
    * Browse (mock) data pointed to in siteconfig in rtypes.list

- Dispatch

    * Hack into the mock support for getting an edit viewname and going 
      to folder-edit state

    * Support a view matching a marker on a resource

    * Demo: default views for two resource types (RootFolder, Folder)

    * Get into a demos/full

    * NotFound state and view on dispatch

    * Start a plugin

- Refactor src/mockapi: eliminate IIFE, don't require the class on 
<body> to turn on mockApi

- Change from "section group menu" to "nav panel". Refactor all of that
 into new, run-time (vs. config-time) approach in src/nav.

- Change the footer to use the siteName.

- No longer set the Restangular base prefix, as this affects sitedev 
Restangular usage.

- Better setup for unit and e2e tests.

## 0.0.4-alpha (2014-12-11)

- Get ``moondash-templates.js`` to put in a leading slash. I keep 
fixing it but my commits aren't sticking.

## 0.0.3-alpha (2014-12-11)

- Add angular-schema form and start an md-form directive with a demo

- Have dist also generate files that support mocks

- Add fonts to dist

- Change from .partial.html to templates/.html

## 0.0.2-alpha (2014-12-08)

- Fix packaging of ui.bootstrap including templates

- Enable Travis

- Copy over fonts in the correct paths

- gulp dist mode for making distributions

- Integrate ui.bootstrap.collapse and use for subsection expand/collapse

- Bundle angular-schema-forms and dependencies

- Start of karma unit test infrastructure

- Client-side and server-side authorization statements and handling 
(switch to login state, etc.) including an easy way to mock these

- Login form with form errors

- Authentication using Satellizer and JWT Tokens, including: login, 
logout, profile, isAuthenticated, notifications, and mocks.

- Notification service for temporarily showing a message

- Add ui.bootstrap for modals

- Have some kind approach for handling <title>

- Put MdLayout in $rootScope.layout as a simple way to get things in 
templates

- Include Restangular, switch to using it

- moondash.mockapi component to allow easy mocking of REST API

- Demonstrate how to override a parent named view (e.g. hijack the 
entire layout)

- Global sections that is there by default and can be injected into

- MdSections service for accumulating the groups/section/subsection 
hierarchy from the declared states


## 0.0.1-alpha (2014-11-28)

- Start a GitHub Pages presence at moonshotproject.github.io/moonshot

- Create demos that explain the base layout

- Start the Moondash Layout component

- Integrate ui-router

- Angular template cache as part of gulp builds

- Better error notification in gulp tasks

- Re-organize src into components

- External (vendors) and app bundles (concat, minified, sourcemaps) based
 on browserify and CommonJS

- Initial layout of gulp tasks with browserify, watch, sass, BrowserSync