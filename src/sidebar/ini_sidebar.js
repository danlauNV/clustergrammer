var change_groups = require('../dendrogram/change_groups');
var search = require('../search');
var all_reorder = require('../reorder/all_reorder');
var ini_cat_reorder = require('../reorder/ini_cat_reorder');

module.exports = function ini_sidebar(cgm){

  var params = cgm.params;

  // initializes sidebar buttons and sliders

  var search_obj = search(params, params.network_data.row_nodes, 'name');

  $(params.root+' .gene_search_box').autocomplete({
    source: search_obj.get_entities
  });

  // submit genes button
  $(params.root+' .gene_search_box').keyup(function(e) {
    if (e.keyCode === 13) {
      var search_gene = $(params.root+' .gene_search_box').val();
      search_obj.find_entity(search_gene);
    }
  });

  $(params.root+' .submit_gene_button').off().click(function() {
    var gene = $(params.root+' .gene_search_box').val();
    search_obj.find_entity(gene);
  });

  var reorder_types;
  if (params.sim_mat){
    reorder_types = ['both'];
  } else {
    reorder_types = ['row','col'];
  }

  /* initialize dendro sliders */
  _.each( reorder_types, function(inst_rc){

    var tmp_rc = inst_rc;
    if (tmp_rc === 'both'){
      tmp_rc = 'row';
    }
    var inst_group = cgm.params.group_level[tmp_rc];
    var inst_group_value = inst_group/10;

    // dendrogram
    $( params.root+' .slider_'+inst_rc ).slider({
      value:inst_group_value,
      min: 0,
      max: 1,
      step: 0.1,
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.value );
        var inst_index = ui.value*10;
        if (inst_rc != 'both'){
          change_groups(cgm, inst_rc, inst_index);
        } else {
          change_groups(cgm, 'row', inst_index);
          change_groups(cgm, 'col', inst_index);
        }
      }
    });

    // reorder buttons
    $(params.root+' .toggle_'+inst_rc+'_order .btn')
      .off()
      .click(function(evt) {

        var order_id = $(evt.target)
          .attr('name')
          .replace('_row','')
          .replace('_col','');

        d3.selectAll(params.root+' .toggle_'+inst_rc+'_order .btn')
          .classed('active',false);

        d3.select(this)
          .classed('active',true);

        if (inst_rc != 'both'){
          all_reorder( cgm, order_id, inst_rc);
        } else{
          all_reorder( cgm, order_id, 'row');
          all_reorder( cgm, order_id, 'col');
        }

      });

  });

  ini_cat_reorder(cgm);

  $( params.root+' .opacity_slider' ).slider({
    // value:0.5,
    min: 0.1,
    max: 2.0,
    step: 0.1,
    slide: function( event, ui ) {

      $( "#amount" ).val( "$" + ui.value );
      var inst_index = 2 - ui.value;

      var scaled_max = params.matrix.abs_max_val * inst_index;

      params.matrix.opacity_scale.domain([0, scaled_max]);

      d3.selectAll(params.root+' .tile')
        .style('fill-opacity', function(d) {
          // calculate output opacity using the opacity scale
          var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
          return output_opacity;
        });


    }
  });

};
