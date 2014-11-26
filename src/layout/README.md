# Moondash Layout

Moondash inherits its theming from ``moonbeam``, a framework-agnostic 
set of markup and styling. It then uses this theme as the basis for a 
``ui-router``-centric *layout*. That is:

- A base state with some core logic and wiring

- A siteroot state with a layout that defines some "slots" that child 
  states can fill.
  
