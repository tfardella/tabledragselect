TableDragSelect

A class to allow selection of rows in a table like the selection of items in a select list by either clicking and dragging or using the shift and control/command keys. Also enables auto-srolling if the table is inside another container.

Usage: tds = new tableDragSelect( "tableId", options );

Options:
 	containgerId: null  - id of the dom element containting the table. Used for scrolling.
 	scrollContet: turn auto scrolling on or off
 	scrollZoneSize: 150 - area in pixels in the container (top and bottom) where when the mouse is clicked scrolling will occur
 	scrollSize: 10 - amount in pixels that the container will scroll when scrolling.
 	mouseupCallBack: null - the function to be called on a mouseup event when scrolling.
 	cssTableDragSelect: tableDragSelect - the CSS class name of tables to add this functionality to.
 	cssSelected: selected - the CSS class name that is added to selected rows
 
The auto-scrolling still needs a bit of work. I'm using the movemove event which means you have to wiggle the mouse to keep scrolling when at the end of the table. I'm investigating better solutions for this. If anyone has thoughts about this I'd love to hear it.

Much thanks to August Lilleaas for his post and the code provided to show how this would work:

http://stackoverflow.com/questions/2013902/select-cells-on-a-table-by-dragging


When scrolling, dealing with the mousewheel in various browswers proved to be problematic. To help with this I recommend checking out Bradon Aaron's mousewheel jQuery plugin. It helps to deal with the differences in the way different browsers interpret the mousewheel.

https://github.com/brandonaaron/jquery-mousewheel