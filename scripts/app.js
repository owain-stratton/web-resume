$(document).ready(function() {


  setTimeout(function() {
    $('.loader').addClass('is-hidden');
  }, 2000);
  // SCROLLING EFFECTS

  $(window).scroll(function() {
    var windowTop = $(window).scrollTop();
    windowTop > 88 ? $('nav').addClass('is-active') : $('nav').removeClass('is-active');
    windowTop > 48 ? $('.ui-down-arrow').addClass('is-hidden') : $('.ui-down-arrow').removeClass('is-hidden');
  });

  setTimeout(function() {
    $('.ui-down-arrow').addClass('is-active');
    $('.sub-head').addClass('is-active');
  }, 5600), setTimeout(function() {
    $('.ui-down-arrow span').addClass('is-active');
  }, 6000), setTimeout(function() {
    animateName();
  }, 2800);


  function animateName() {
    $('#name g').each(function(i) {
      var g = $(this);
      setTimeout(function() {
        g.addClass('animated');
      }, 100 * i);
    });
  }


  $('a[href^="#"]').on('click', function(event) {

    var target = $(this.getAttribute('href'));

    if (target.length) {
      event.preventDefault();
      $('html, body').stop().animate({
        scrollTop: target.offset().top
      }, 1000);
    }

  });

  var aChildren = $("nav li").children(),
    aArray = [];

  for (var i = 0; i < aChildren.length; i++) {

    var aChild = aChildren[i],
      ahref = $(aChild).attr('href');

    aArray.push(ahref);
  }

  $(window).scroll(function() {
    var windowPos = $(window).scrollTop(),
      windowH = $(window).height(),
      docH = $(document).height();

    for (var i = 0; i < aArray.length; i++) {

      var theID = aArray[i],
        divPos = $(theID).offset().top - 200,
        divHeight = $(theID).height() + 200;

      if (windowPos >= divPos && windowPos < (divPos + divHeight)) {
        $("a[href='" + theID + "']").addClass('is-active');
      } else {
        $("a[href='" + theID + "']").removeClass('is-active');
      }
    }

    if (windowPos + windowH == docH) {
      if (!$("nav li:last-child a").hasClass('is-active')) {

        var navActiveCurrent = $('is-active').attr('href');

        $("a[href='" + navActiveCurrent + "']").removeClass('is-active');
        $('nav li:last-child a').addClass('is-active');

      }
    }
  });


  // D3 BEGIN VIZ

  var opacNode = .5,
    opacHigh = .8,
    opacLink = .4,
    opacLow = .15;

  var container = $('#chart'),
    width = container.width(),
    height,
    color = '#ffbc79';

  if ($(window).width() >= 768) {
    height = 600;
  } else {
    height = 450;
  }

  var svg = d3.select('#chart').append('svg')
    .attr({
      width: width,
      height: height,
      id: 'sankeySVG'
    });

  var g = svg.append('g');



  var sankey = d3.sankey()
    .nodeWidth(12)
    .nodePadding(12)
    .size([width, height]);

  var path = sankey.link();

  d3.json('../data/skills.json', function(error, data) {

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
          d.id = i;
          return 'link-' + i;
        },
        'shape-rendering': 'optimizeQuality'
      })
      .style({
        'stroke-width': function(d) {
          return Math.max(2, d.dy);
        },
        fill: 'none',
        opacity: opacLink,
        stroke: color,
        'stroke-opacity': opacLink
      })
      .sort(function(a, b) {
        return b.dy - a.dy;
      })
      .on('mouseover', linkMouseEv)
      .on('mouseout', mouseOut);



    var node = g.append('g').selectAll('.node')
      .data(data.nodes)
      .enter().append('g')
      .attr({
        class: 'node',
        transform: function(d) {
          return 'translate(' + d.x + ', ' + d.y + ')';
        }
      })
      .on('mouseover', nodeMouseEv)
      .on('mouseout', mouseOut);

    node.append('rect')
      .attr({
        height: function(d) {
          return d.dy;
        },
        width: sankey.nodeWidth(),
        id: function(d, i) {
          d.id = i;
          return 'id-' + i;
        }
      })
      .style({
        fill: color,
        opacity: opacNode
      })
      .on('mouseover', function(d) {
        d3.select(this).style('opacity', 1);
      })
      .on('mouseout', function(d) {
        d3.select(this).style('opacity', opacNode);
      });

    node.append('text')
      .attr({
        x: -6,
        y: function(d) {
          return d.dy / 2;
        },
        dy: '.3em',
        'text-anchor': 'end',
        transform: null,
        id: function(d, i) {
          d.id = i;
          return 'textid-' + d.node;
        }
      })
      .text(function(d) {
        return d.name
      })
      .filter(function(d) {
        return d.x < width / 3;
      })
      .attr({
        x: 6 + sankey.nodeWidth(),
        'text-anchor': 'start'
      });


    function nodeMouseEv(d, i) {

      var remainingNodes = [],
        nextNodes = [];

      var stroke_opacity = opacHigh;


      var traverse = [{
        linkType: 'sourceLinks',
        nodeType: 'target'
      }, {
        linkType: 'targetLinks',
        nodeType: 'source'
      }];

      traverse.forEach(function(step) {
        d[step.linkType].forEach(function(link) {
          remainingNodes.push(link[step.nodeType]);
          highlight_link(link.id, stroke_opacity);
        });

        while (remainingNodes.length) {
          nextNodes = [];
          remainingNodes.forEach(function(node) {
            node[step.linkType].forEach(function(link) {
              nextNodes.push(link[step.nodeType]);
              highlight_link(link.id, stroke_opacity);
            });
          });
          remainingNodes = nextNodes;
        }

      });
    }

    function linkMouseEv(d) {

      svg.selectAll('.link').classed('active', function(p) {
        return p === d;
      });

      svg.selectAll('.link.active')
        .style({
          'stroke-opacity': opacHigh
        });


      svg.selectAll('.node rect').style('opacity', function(p) {
        if (p === d.source || p === d.target) {
          return 1;
        } else {
          return opacNode;
        };
      });

      var nodeSourceId = 'textid-' + d.source.node;
      var nodeTargetId = 'textid-' + d.target.node;
      var sourceLength = d.source.sourceLinks.length;
      var targetLength = d.target.targetLinks.length;

      //set active class on text node of hovered element
      $('text#' + nodeSourceId).addClass('active');
      $('text#' + nodeTargetId).addClass('active');

    }

    function highlight_link(id, opacity) {

      d3.select('#link-' + id).style('stroke-opacity', opacity);
    }



    function mouseOut() {

      svg.selectAll('.link')
        .style({
          'stroke-opacity': opacLink
        });

      svg.selectAll('.node rect')
        .style({
          opacity: opacNode
        });

      d3.selectAll('text').classed('active', false);
      d3.selectAll('link.active').classed('active', false);

    }


    $(window).resize(function() {

      width = container.width();

      //check for window width to set sankeyH, width, innerR, outerR
      if ($(window).width() >= 768) {
        height = 600;
      } else {
        height = 500;
      }


      //update vis SVG's height and width
      svg
        .attr({
          width: width,
          height: height
        });

      //update sankey width
      sankey
        .size([width, height]);

      //reset sankey
      sankey
        .nodes(data.nodes)
        .links(data.links)
        .layout(32);

      //Update node positioning
      node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });

      //Update rect height
      d3.selectAll('rect')
        .attr('height', function(d) {
          return d.dy;
        });

      //update links
      link
        .attr('d', path)
        .style({
          'stroke-width': function(d) {
            return Math.max(2, d.dy);
          }
        });

      //update text positioning
      d3.selectAll('text')
        .attr({
          y: function(d) {
            return d.dy / 3 * 2;
          }
        });

      d3.selectAll('text')
        .filter(function(d) {
          return d.x < width / 2;
        })
        .attr({
          y: function(d) {
            return d.dy / 2;
          }
        });



    }); //end function resize
  }); // end d3.json async function
});
