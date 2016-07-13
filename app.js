$(document).ready(function() {
    
    
    // SCROLLING EFFECTS
    
    $(window).scroll(function(){
        var windowTop = $(window).scrollTop();
        windowTop > 88 ? $('nav').addClass('is-active') : $('nav').removeClass('is-active');
    });
    
    $('a[href^="#"]').on('click', function(event) {
        
        var target = $(this.getAttribute('href'));

        if( target.length ) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top
            }, 1000);
        }

    });
    
    var aChildren = $("nav li").children(),
        aArray = []; 
    
    for (var i=0; i < aChildren.length; i++) {
        
        var aChild = aChildren[i],
            ahref = $(aChild).attr('href');
        
        aArray.push(ahref);
    }

    $(window).scroll(function(){
        var windowPos = $(window).scrollTop(), 
            windowH = $(window).height(), 
            docH = $(document).height();

        for (var i=0; i < aArray.length; i++) {
            
            var theID = aArray[i],
                divPos = $(theID).offset().top - 200,
                divHeight = $(theID).height() + 200;
            
            if (windowPos >= divPos && windowPos < (divPos + divHeight)) {
                $("a[href='" + theID + "']").addClass('is-active');
            } else {
                $("a[href='" + theID + "']").removeClass('is-active');
            }
        }

        if(windowPos + windowH == docH) {
            if (!$("nav li:last-child a").hasClass('is-active')) {
                
                var navActiveCurrent = $('is-active').attr('href');
                
                $("a[href='" + navActiveCurrent + "']").removeClass('is-active');
                $('nav li:last-child a').addClass('is-active');
                
            }
        }
    });
    
    
    // D3 BEGIN VIZ
    
    var opacDefault = .4,
        opacLow = .15;
//        units = 'level';
    
    var container = $('#chart'),
        width = container.width(),
        height = container.height();
//        formatNumber = d3.format(",.0f"),
//        format = function(d) { return units + ' ' + formatNumber(d); };
    
    
    
    var svg = d3.select('#chart').append('svg')
        .attr({
            width: '100%',
            height: '100%',
            viewBox: '0 0 ' + width + ' ' + height,
            preserveAspectRatio: 'xMinYMin',
            id: 'sankeySVG'
        });
    
    var g = svg.append('g');
//        .attr({
//            transform: 'translate(' + width / 2 + ', ' + height / 2 + ')'
//        });
    
    
    var sankey = d3.sankey()
        .nodeWidth(24)
        .nodePadding(12)
        .size([width,height]);
    
    var path = sankey.link();
    
    d3.json('skills.json', function(error, data) {
        
        sankey
            .nodes(data.nodes)
            .links(data.links)
            .layout(32);
        
        var link = g.append('g').selectAll('.link')
            .data(data.links)
            .enter().append('path')
            .attr({
                class: 'link',
                d: path,
                id: function(d, i) {
                    return 'link' + i;
                }
            })
            .style({
                'stroke-width': function(d) {
                    return Math.max(1, d.dy);
                },
                fill: 'none',
                stroke: '#d9d9d9',
                'stroke-opacity': opacDefault
            })
            .sort(function(a, b) { return b.dy - a.dy; });
        
//        link.append('title')
//            .text(function(d) {
//                return d.source.name + ' → ' + d.target.name + '\n' + format(d.value);     
//            });
        
        var node = g.append('g').selectAll('.node')
            .data(data.nodes)
            .enter().append('g')
            .attr({
                class: 'node',
                transform: function(d) {
                    return 'translate(' + d.x + ', ' + d.y + ')';
                }
            });
        
        node.append('rect')
            .attr({
                height: function(d) {
                    return d.dy;
                },
                width: sankey.nodeWidth()
            })
            .style({
                fill: '#cccccc',
                stroke: '#cccccc',
                'stroke-width': '2px'
            })
            .on('mouseover', nodeMouseEv)
            .on('mouseout', mouseOut);
        
        node.append('text')
            .attr({
                x: -48,
                y: function(d) {
                    return d.dy / 2;
                },
                dy: '.1em',
                textAnchor: 'end',
                transform: null
            })
            .text(function(d) {
                return d.name
            })
            .filter(function(d) {return d.x < width / 3; })
            .attr({
                x: 6 + sankey.nodeWidth(),
                textAnchor: 'start'
            });
        
        
    }); // end d3.json async function
    
    
    
    
    function linkMouseEv(d) {
        
        svg.selectAll('.link').classed('active', function(p) { return p === d; });
        svg.selectAll('.node rect').classed('active', function(p) {
            return p === d.source || p === d.target; 
        });
        
        svg.selectAll('.link.active')
            .style({
                'stroke-opacity': .7
            });
        
    }
    
    function nodeMouseEv(d) {
        
        svg.selectAll('.link').classed('active', function(p) { 
            return p.source === d || p.target === d; 
        });
        svg.selectAll('.link').classed('inactive', function(p) { 
            return p.source !== d && p.target !== d; 
        });
        
        d3.select(this).classed('active', true);
        
        
        
        svg.selectAll('.link.active')
            .style({
                'stroke-opacity': .7
            });
        
        svg.selectAll('.link.inactive')
            .style({
                'stroke-opacity': opacLow
            });
        
        
        
        
    }
    
    
    function mouseOut() {
        
        svg.selectAll('.link.active')
            .style({
                'stroke-opacity': opacDefault
            });
        
        svg.selectAll('.link.inactive')
            .style({
                'stroke-opacity': opacDefault
            });
        
        svg.selectAll('.active').classed('active', false);
        svg.selectAll('.inactive').classed('inactive', false);
        
        
    }
    
    
    
    
    
    
    
    
//    function highlightNodeLinks(node, i) {
//        
//        console.log('running');
//        var remainingNodes = [],
//            nextNodes = [];
//
//        var stroke_opacity = 0;
//        if (d3.select(this).attr('data-clicked') == '1') {
//            d3.select(this).attr('data-clicked', '0');
//            stroke_opacity = 0.2;
//        } else {
//            d3.select(this).attr('data-clicked', '1');
//            stroke_opacity = 0.5;
//        }
//
//        var traverse = [{
//            linkType: 'sourceLinks',
//            nodeType: 'target'
//                        }, {
//            linkType: 'targetLinks',
//            nodeType: 'source'
//                        }];
//
//        traverse.forEach(function (step) {
//            node[step.linkType].forEach(function (link) {
//                remainingNodes.push(link[step.nodeType]);
//                highlight_link(link.id, stroke_opacity);
//            });
//
//            while (remainingNodes.length) {
//                nextNodes = [];
//                remainingNodes.forEach(function (node) {
//                    node[step.linkType].forEach(function (link) {
//                        nextNodes.push(link[step.nodeType]);
//                        highlight_link(link.id, stroke_opacity);
//                    });
//                });
//                remainingNodes = nextNodes;
//            }
//        });
//    }
//    
//    function highlight_link(id, opacity) {
//        d3.select('#link-' + id).style('stroke-opacity', opacity);
//    }
//    
//    function fade(opacity) {
//        return function(d, i) {
//            console.log(d);
//            svg.selectAll('path.link')
//                .filter(function(d) { 
//                    return d.sourceLinks !== i && d.targetLinks !== i; 
//            })
//            .transition("fadeOnArc")
//            .style("opacity", opacity);
//        };
//    }

     
    
    
    
    
});