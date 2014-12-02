---
layout: page
title:  "Registering with the Section System"
---

# Registering with the Section System

Moondash has an existing UX that you can register custom states with. 
Learn more about section groups, sections, and subsections.

## The Need

You don't have to extend Moondash. You can point it at a compliant REST
endpoint and get CRUD for defined types. However, Moondash also wants 
to be extensible by letting you create new ``ui-router`` states that 
fill in the named views in the UX.

That's all great, but how do users get a menu-like, sitemap-style 
listing of these states that you have injected? If you add some 
information to your states and substates, Moondash will draw section 
groups, sections and subsections.

## Features

- Section groups are collections of sections, which can contain 
subsections that appear accordion-style

- 3-level deep menu UX, out-of-the-box

- Influence ordering by assigning a ``priority`` value

- (Pending) When a state is active, it is highlighted in the menu


## Example

You have a new "Account Status" state and you'd like it to show in the 
menu. It is the only one that you have, so you don't particularly need 
an entire section group. You can just add it to the predefined ``root``
section group:

{% highlight javascript %}
.state("root.accountstatus", {
         url: '/accountstatus',
         section: {
           group: 'root',
           label: 'Account Status'
         },
{% endhighlight %}

Perhaps, though, you have a set of custom reports related to accounts. 
You'd like a heading ``Accounts`` in the sections menu, containing a 
listing of the states. Let's model this as a parent state with two 
child states, both which should show up as sections in an ``Accounts`` 
section group:

{% highlight javascript %}
.state('reports', {
         parent: 'root',
         sectionGroup: {
           label: 'Reports',
           priority: 2
         }
       })
.state('reports.payables', {
         url: '/payables',
         section: {
           group: 'reports',
           label: 'Payables',
           priority: 3
         },
         views: {
           'md-content@root': {
             templateUrl: 'reports-payables.partial.html'
           }
         }
       })
.state('reports.receivables', {
         url: '/receivables',
         section: {
           group: 'reports',
           label: 'Receivales',
           priority: 3
         },
         views: {
           'md-content@root': {
             templateUrl: 'reports-receivables.partial.html'
           }
         }
       })
{% endhighlight %}

You can go one step further and indicate that a section is actually a 
container of subsections which should appear accordion-style:

{% highlight javascript %}
 subsection: {
   section: 'root.dashboard',
   label: 'All',
   priority: 0
 },
{% endhighlight %}


## How It Works

States are registered with ``ui-router`` and Moondash gets a listing of
all states at startup time. A function goes through the list of all 
states and looks for the extra properties of ``sectionGroup``, 
``section``, and ``subsection``. The code then returns a datastructure 
with all the sorted subitems, including sections that are registered in
the core of Moondash.
 
 