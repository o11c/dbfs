$(function() {
  var path = ["/"];
  var cwd = [];
  var sort = 'sort-type';
  var sortFunc = compareType;
  var sortReverse = false;
  var modal = null;
  
  // Load the file list
  getDir();

  // Select item from file list
  $('#file-list').click(function(e) {
      $('#file-list tr td').removeClass('selected');
      var row = $(e.target).closest('tr');

      if (row.attr('id') == 'header-row') {
        $('#actions #file-actions .button').addClass('disable');
      } else {
        row.children('td').toggleClass('selected');
        $('#actions #file-actions .button').removeClass('disable');
      }
  });

  // Sort by...
  $('#header-row').click(function(e) {
    var header = $(e.target).closest('th');
    var id = header.attr('id');

    $('#header-row th img').remove();

    if (id === sort) {
      sortReverse = !sortReverse;
    } else {
      sort = id;
      sortReverse = false;
    }

    var sf = null;

    if (sort === 'sort-name') {
      sf = compareName;
    } else if (sort === 'sort-date') {
      sf = compareDate;
    } else if (sort === 'sort-type') {
      sf = compareType;
    } else if (sort === 'sort-size') {
      sf = compareSize;
    }

    if (sortReverse) {
      sortFunc = function(a, b) { return -(sf(a, b)); }
      header.prepend('<img src="img/arrow_up.png"> ');
    } else {
      sortFunc = sf;
      header.prepend('<img src="img/arrow_down.png"> ');
    }

    rebuildFileList();
  });

  // Open item from file list
  $('#file-list').dblclick(function(e) {
    var row = $(e.target).closest('tr');
    var file = row.find("td:first-child").text().trim();
    if (row.hasClass("directory")) {
      $('#actions #file-actions .button').addClass('disable');
      path.push(file);
      getDir();
      rebuildFileList();
      rebuildBreadCrumbs();
    }
  });

  // Breadcrumb links
  $('#breadcrumbs').click(function(e) {
    if (!$(e.target).is('a')) {
      return;
    }

    var link = $(e.target);
    var id = link.attr('id');
    id = parseInt(id.substr(2, id.length));
    path = path.splice(0, id+1);

    getDir();

    rebuildFileList();
    rebuildBreadCrumbs();
  });

  // Select file to upload
  $('#select-file-button').click(function() {
    $('#upload-file').click();
  });

  // File was selected to upload
  $('#upload-file').change(function(){
    var path = $(this).val();
    if (path.match(/fakepath/)) {
      path = path.replace(/C:\\fakepath\\/i, '');
    }
    $('#select-file-button').text(path);
    $('#upload-button').removeClass('disable');
  });

  // Create new directory window
  $('#create-directory-button').click(function(e) {
    modal = $('div.modal').omniWindow();
    modal.trigger('show');
    
    $('#create-directory-form #dir-name').focus();

    $('.close-button').click(function(e){
      e.preventDefault();
      modal.trigger('hide');
    });
  });
  
  // Create new directory button
  $('#create-directory-form .button').click(createDirFromForm);
  $('#create-directory-form input').keyup(createDirFromForm);
  
  function createDirFromForm(e) {
    if (e.type === 'keyup' && e.which != 13) return;
    
    var dirName = $('#create-directory-form #dir-name').val();
    $('#create-directory-form #dir-name').val("");
    
    $('#actions #file-actions .button').addClass('disable');
    
    createDir(dirName);
    modal.trigger('hide');
  }

  function rebuildFileList() {
    $('#file-list tr').not('[id~="header-row"]').remove();

    if (sortFunc != null) {
      cwd.sort(compareName);
      cwd.sort(sortFunc);
    }

    for (var file in cwd) {
      var entry = cwd[file];
      var rowClass = '';
      var size = '';

      if (entry.type === "Directory") {
        rowClass = 'directory';
      }

      if (entry.size) {
        size = entry.size + ' bytes';
      }

      var row = '<tr class="' + rowClass + '">'
              + '  <td><img src="img/type_' + entry.icon + '.png" /> ' + entry.name + '</td>'
              + '  <td>' + entry.modified + '</td>'
              + '  <td>' + entry.type + '</td>'
              + '  <td>' + size + '</td>'
              + '</tr>';

      $('#file-list').contents().append(row);
    }
  }
  
  function createDir(dirName) {
    var dirPath = "/";
    for (var i = 1; i < path.length; i++) {
      dirPath += path[i] + "/";
    }
    dirPath += dirName + "/";
    $.get("createDir.html?path=" + dirPath, function(data) {
      getDir();
    });
  }
  
  function getDir() {
    var dirPath = "/";
    for (var i = 1; i < path.length; i++) {
      dirPath += path[i] + "/";
    }
    $.get("directory.json?path=" + dirPath, function(data) {
      cwd = data.contents;
      for (var i = 0; i < cwd.length; i++) {
        var filename = cwd[i].name;
        if (filename.charAt(filename.length - 1) === "/") {
          cwd[i].name = filename.slice(0, filename.length - 1);
          cwd[i].type = "Directory";
          cwd[i].icon = "directory";
        } else {
          cwd[i].type = "Text File";
          cwd[i].icon = "text";
        }
      }
      rebuildFileList();
      rebuildBreadCrumbs();
    });
  }

  function rebuildBreadCrumbs() {
    var html = '<img src="img/page_link.png" /> ';
    var sep = '';
    for (var i = 0; i < path.length; i++) {
      var bcPath = path[i];
      if (path[i] === "/") {
        bcPath = "root";
      }
      html += sep + '<a href="#" id="bc' + i + '">' + bcPath + '</a>'
      sep = ' / ';
    }
    $('#breadcrumbs').html(html);
  }

  function compareName(a, b) {
    if (a.name < b.name) {
      return -1;
    }
    return 1;
  }

  function compareDate(a, b) {
    if (a.modified < b.modified) {
      return -1;
    } else if (a.modified > b.modified) {
      return 1;
    }
    return 0;
  }

  function compareType(a, b) {
    if (a.type < b.type) {
      return -1;
    } else if (a.type > b.type) {
      return 1;
    }
    return 0;
  }

  function compareSize(a, b) {
    if (a.size < b.size) {
      return -1;
    } else if (a.size > b.size) {
      return 1;
    }
    return 0;
  }
});
