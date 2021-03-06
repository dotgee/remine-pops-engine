//= require ./vendor/vendor

VMM.Util.untagify = function(text) { return text; }


$(document).ready(function() {

  if(document.getElementById("project_id")) {
    $.ajax({
      type: 'get',
      url: '/projects/'+$("#project_id").attr('value')+'/timeline',
      success: function (data) {
        createTimeline(data);
      }
    });

    function createTimeline(data) {
        createStoryJS({
            width: "100%",
            height: "350",
            start_at_end: true,
            start_zoom_adjust: '0',
            source: data,
            type: 'timeline',
            embed_id: 'time_line'
        });
    }
  }

  // jQuery('input[name=switch]:radio').click(function(){
  //     var v = jQuery(this).val();
  //     if(v == "radio_file") {
  //       $("#file").show();
  //       $("#hal").hide();
  //       $("#url").hide();
  //       $("#document_url_to").val('');
  //       $("#url_input_doc").val('');
  //     }
  //     else if(v == "radio_hal") {
  //       $("#file").hide();
  //       $("#hal").show();
  //       $("#url").hide();
  //       $("#document_url_to").val('');
  //       $("#url_input_doc").val('');
  //     }
  //     else if(v == "radio_url") {
  //       $("#file").hide();
  //       $("#hal").hide();
  //       $("#url").show();
  //       $("#document_url_to").val('');
  //       $("#url_input_doc").val('');
  //     }
  // });


  $("#document_category_id").select2().on("change", function(e) {
    if($("#document_category_id").select2('data').text == "Gestion de projet") {
      $("#document_visible_to_public").attr('checked', false);
    }
    else {
      $("#document_visible_to_public").attr('checked', true);
    }
  })

  if(document.getElementById("document_tag_list")) {
    var tag = $("#document_tag_list").val();
    var $radios = $('input:radio[name=switch2]');
    if($radios.is(':checked') === false) {
      $radios.filter('[value="'+tag+'"]').prop('checked', true);
      if($radios.is(':checked') === false) {
        $radios.first().prop('checked', true);
        $("#document_tag_list").val($radios.first().val());
      }
    }

    jQuery('input[name=switch2]:radio').click(function(){
      var v = jQuery(this).val();
      $("#document_tag_list").val(v);
    });
  }

  // setDocumentTitle();
  $('#document_title').on('change', function (event, tab) {
    if($(this).val().length == 0) {
      $("#document_hal").prop('disabled', false);
    }
    else {
      $("#document_hal").prop('disabled', true);
    }
  });

  $('#document_hal').on('click', function (event, tab) {
    if($(this).prop('checked')) {
      setDocumentTitle(tab);
    }
    else {
      $("#document_title").select2('destroy');
    }
  });
});

function setDocumentTitle() {
  $("#document_title").addClass('select2');
  $("#document_title").select2({
      minimumInputLength: 3,
      placeholder: "Rechercher un article par son titre et/ou ses auteurs",
      allowClear: true,
      multiple: false,
      id: function(hit) {
        return hit.identifiant;
      },
      ajax: {
          url: '/pops/searchHal',
          dataType: 'json',
          //quietMillis: 1000,
          type: 'get',
          data: function (term) {
              return {
                  title: term
              };
          },
          results: function (data) {
              return {results: data};
          }
      },
      formatResult: halFormatResult,
      formatSelection: halFormatSelection,
      initSelection: function(element, callback) {
        var title=$("#document_title").val();
        if (title!=="") {
            $.ajax("/pops/searchHal", {
                type: 'get',
                data: {
                    title: title
                },
                dataType: "json"
            }).done(function(data) { callback(data[0]); });
        }
      }
  });
}

function halFormatResult(item) {
  return item.title;
}

function halFormatSelection(item) {
  searchArticleOnHal(item.identifiant, item.version, item.url)
  return item.title;
}


function searchHal() {
  if(document.getElementById("hal_url")) {
    if($("#hal_url").val() != "") {
      $.ajax({
        type: 'get',
        url: '/pops/searchHal?title=' + $("#hal_url").val(),
        success: function (data) {
          console.log(data);
          setSelect(data);
        }
      });
    }
  }
}

function searchArticleOnHal(id, version, url) {
  $.ajax({
    type: 'get',
    url: '/pops/searchArticleOnHal?identifiant=' + id + '&version=' + version,
    success: function (data) {
      $("#document_title").val(data.title);
      $("#document_created_date").val(data.datepub);
      $("#document_description").val(data.resume + "\n" + data.description);
      $("#document_url_to").val(url);
      $("#url_input_doc").val(url);
    }
  });

}

function setSelect(data) {
  $('#hal_url_list').show();
  $('#hal_url_list').empty();
  $("#hal_url_list").append(new Option('', ''));
  document.getElementById("hal_results").innerHTML= 'La recherche a retournée ' + data.length + ' résultats.';
  for (var i=0; i<data.length; i++) {
    var op = new Option(data[i].title + " - version "+data[i].version, data[i].url);
    op.setAttribute("identifiant",data[i].identifiant);
    op.setAttribute("version",data[i].version);
    $("#hal_url_list").append(op);
  }
}

function setUrlHal(url) {
  if(document.getElementById("document_url_to")) {
    $("#document_url_to").val($("#hal_url_list").val());
    $("#url_input_doc").val($("#hal_url_list").val());
    searchArticleOnHal();
  }
}
