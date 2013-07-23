/*
 * TableDragSelect
 *
 * Enable selection of rows in a table just like in a select box by either clicking and dragging 
 * or using the shift and control/command keys.
 * 
 * @requires jQuery 1.9
 *
 * Usage: tds = new tableDragSelect( "tableId", options );
 *
 * Options:
 *      containgerId: null  - id of the dom element containting the table. Used for scrolling.
 *      scrollContet: turn auto scrolling on or off
 *      scrollZoneSize: 150 - area in pixels in the container (top and bottom) where when the mouse is clicked scrolling will occur
 *      scrollSize: 10 - amount in pixels that the container will scroll when scrolling.
 *      mouseupCallBack: null - the function to be called on a mouseup event when scrolling.
 *      cssTableDragSelect: tableDragSelect - the CSS class name of tables to add this functionality to.
 *      cssSelected: selected - the CSS class name that is added to selected rows
 *
 */

// constructor
var tableDragSelect = function ( element, options )
{
    // Create the defaults once
    var defaults = {
        containerId: null,
        scrollContent: true,
        scrollZoneSize: 150,
        scrollSize: 10,
        mouseupCallback: null,

        //CSS class names
        cssTableDragSelect: "tableDragSelect",
        cssSelected: "selected"
    };

    var self = this;

    this.element = element;

    this.options = $.extend ( {}, defaults, options );

    this.init();

    return self;
 };

tableDragSelect.prototype =
{
    init: function()
    {
        var self = this, table = this.element;

        var isMouseDown = false, scrollDir = null, isSelected, prevMousemove, mousemoveDirection,
            isShiftPressed = false, isCtrlPressed = false, isAltPressed = false, isCmdPressed = false,
            lastSelectedRow = null;

        cont = this.options.containerId ? $( "#" + this.options.containerId ) : null;

        if( cont !== null )
        {
            cont.bounds = getElBounds( cont );
        }
        else
        {
            this.options.scrollContet = false;
        }

        function getElBounds( el )
        {
            var ofs, bottom;

            if( el !== null )
            {
                ofs = $( el ).offset();
                bottom = ofs.top + $( el ).height();
                return { top: ofs.top , left: ofs.left , width: $( el ).width() , height: $( el ).height(), bottom: bottom };
            }
        }

        function inScrollZone( e, el, zHeight )
        {
            var b = getElBounds( el ), zone = null;

            if( e.clientY > b.bottom - zHeight )
            {
                zone = "down";
            }
            else if ( e.clientY < b.top + zHeight )
            {
                zone = "up";
            }

            return zone;
        }

        function keyDownHandler( e )
        {
            if( e.which == 16 )
            {
                isShiftPressed = true;
            }

            if( e.which == 17 )
            {
                isCtrlPressed = true;
            }

            if( e.which == 18 )
            {
                isAltPressed = true;
            }

            if( e.which == 224 )
            {
                isCmdPressed = true;
            }

//            debug ? ( console.log( "KeyDown - Shift: " + isShiftPressed + "  Ctrl: " + isCtrlPressed + "  Alt: " + isAltPressed + " Cmd: " + isCmdPressed ) ) : null;
        }

        function keyUpHandler( e )
        {
            if( e.which == 16 )
            {
                isShiftPressed = false;
            }

            if( e.which == 17 )
            {
                isCtrlPressed = false;
            }

            if( e.which == 18 )
            {
                isAltPressed = false;
            }

            if( e.which == 224 )
            {
                isCmdPressed = false;
            }

//            debug ? console.log( "KeyUp - Shift: " + isShiftPressed + "  Ctrl: " + isCtrlPressed + "  Alt: " + isAltPressed + " Cmd: " + isCmdPressed ) : null;
        }

        function wheelHandler( e, delta, deltaX, deltaY )
        {
            if( cont )
            {
//                debug ? console.log( "delta: " + delta + " - deltaX: " + deltaX + " - deltaY: " + deltaY ) : null;

                if( isNaN( deltaY ) )
                {
                    // IE seems to only output values of 1/-1 for the delta value
                    cont.scrollTop( cont.scrollTop() - ( delta * self.options.scrollSize ) ) ;
                }
                else
                {
                    cont.scrollTop( cont.scrollTop() - deltaY );
                }

                e.stopPropagation();
                return false;
            }
        }

        function scrollContent()
        {
            if( isMouseDown && self.options.scrollContent === true )
            {
                if (  cont !== null && scrollDir )
                {
                    if( scrollDir.toLowerCase() == "up" && mousemoveDirection == "up" )
                    {
                        cont.scrollTop( cont.scrollTop() - self.options.scrollSize );
                    }
                    else if( scrollDir.toLowerCase() == "down" && mousemoveDirection == "down" )
                    {
                        cont.scrollTop( cont.scrollTop() + self.options.scrollSize );
                    }
                }

                return false;
            }
        }

        function handleShiftSelect( row )
        {
            var rows, i, inRange = false;

            if( lastSelectedRow !== null )
            {
                rows = $( table ).find( "tr" );

                if( isCtrlPressed === false && isCmdPressed === false )
                {
                    self.selectNone( table );
                }

                for ( i = 0; i < rows.length; i++ )
                {
                    if ( ( rows[ i ] === row || rows[ i ] === lastSelectedRow ) && inRange === false )
                    {
                        inRange = true;
                    }
                    else if ( ( rows[ i ] === row || rows[ i ] === lastSelectedRow ) && inRange === true )
                    {
                        inRange = false;
                    }

                    if ( inRange === true )
                    {
                        $( rows[ i ] ).addClass( self.options.cssSelected  );
                    }

                    $( lastSelectedRow ).addClass( self.options.cssSelected  );
                    $( row ).addClass( self.options.cssSelected  );
                }
            }
        }

        function handleScrollingMouseMove( e )
        {
            if( isMouseDown )
            {
                // Check which direction the mouse is moving
                if( prevMousemove === null )
                {
                    prevMousemove = e.pageY;
                }
                else if( prevMousemove > e.pageY )
                {
                    mousemoveDirection = "up";
                }
                else if( prevMousemove < e.pageY )
                {
                    mousemoveDirection = "down";
                }

                prevMousemove = e.pageY;

                if( cont !== null )
                {
                    scrollDir = inScrollZone( e, cont, self.options.scrollZoneSize );
                }

                scrollContent ();

                e.stopPropagation ();
                return false;
            }
            else
            {
                scrollDir = null;
            }
        }

        function handleScrollingMouseDown( e )
        {
            if( cont )
            {
                isMouseDown = true;

                if ( cont !== null )
                {
                    scrollDir = inScrollZone( e, cont, self.options.scrollZoneSize );
                }

                if ( scrollDir )
                {
                    scrollContent();
                }

                e.stopPropagation();
                return false;
            }
        }

        function handleSelectionMouseDown( e )
        {
            var row = this;

            isMouseDown = true;

            if ( isShiftPressed )
            {
                handleShiftSelect( row );
            }
            else if ( isCtrlPressed || isCmdPressed )
            {
                $( row ).toggleClass( self.options.cssSelected  );
            }
            else
            {
                $( self.element ).find( "tbody tr" ).removeClass( self.options.cssSelected );
                $( row ).toggleClass( self.options.cssSelected  );
            }

            isSelected = $( this ).hasClass( self.options.cssSelected  );

            if ( isSelected && isShiftPressed === false)
            {
                lastSelectedRow = row;
            }
            else if ( self.getSelectedCount( table ) === 0 )
            {
                lastSelectedRow = null;
            }

            return false; // prevent text selection
        }

        if ( $( this.element ).prop( "tagName" ).toLowerCase() == "table" )
        {
            // Handle scrolling
            $( table ).mousemove( handleScrollingMouseMove );

            $( table ).bind ( "selectstart",
                function ( e )
                {
                    return false; // prevent text selection in IE
                }
            );

            $( table ).mousedown( handleScrollingMouseDown );

            $( table ).mouseup (
                function( e )
                {
                    isMouseDown = false;

                    e.stopPropagation();
                    return false;
                }
            );

            $( table ).on( "mousewheel", wheelHandler );

            // Handle selection
            var rows = $( table ).find( "tr" );

            for( i = 0; i < rows.length; i++ )
            {
                var row = rows[ i ];

                $( row ).mousedown( handleSelectionMouseDown );

                $( row ).mouseover(
                    function ( e )
                    {
                        if ( isMouseDown ) {
                            $( this ).toggleClass( self.options.cssSelected , isSelected );
                        }
                    }
                );

                $( row ).mouseup(
                    function ( e )
                    {
                        if( self.options.mouseupCallback )
                        {
                            self.options.mouseupCallback();
                        }
                    }
                );

                $( row ).bind( "selectstart",
                    function ( e )
                    {
                        return false; // prevent text selection in IE
                    }
                );
            }

            $( document ).keydown( keyDownHandler );

            $( document ).keyup( keyUpHandler );

            $( document ).mouseup(
                function ( e )
                {
                    isMouseDown = false;
                }
            );                
        }

    }, // end init

    getSelectedCount: function( )
    {
        return $( this.element ).find( "tbody tr." + this.options.cssSelected ).length;
    },

    getSelectedItems: function( )
    {
        return $( this.element ).find( "tbody tr." + this.options.cssSelected );
    },

    selectAll: function( )
    {
        $( this.element ).find( "tbody tr" ).addClass( this.options.cssSelected );

        if( this.options.mouseupCallback )
        {
            this.options.mouseupCallback();
        }
    },

    selectNone: function( )
    {
        $( this.element ).find( "tbody tr" ).removeClass( this.options.cssSelected );

        if( this.options.mouseupCallback )
        {
            this.options.mouseupCallback();
        }
    }

};
