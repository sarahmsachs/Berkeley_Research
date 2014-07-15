// THIS CODE TAKES CARE OF THE BUBBLE THAT APPEARS ON THE ANNOTATION TOOL
// WHEN EDITING OBJECT PROPERTIES

// *******************************************
// Public methods:
// *******************************************

// This function creates the popup bubble.  Takes as input (x,y) location,
// the html to include inside the popup bubble, and the dom element to 
// attach to. Returns the dom element name for the popup bubble.
function CreatePopupBubble(left,top,innerHTML,dom_attach) {
  var html_str;
  var bubble_name = 'myPopup';
  
  // Adjust location to account for the displacement of the arrow:
  left -= 22;
  if (left < 5) left = 5;
  
  // Select the vertical position of the bubble decoration arrow
  if (top > 214) {
    html_str  = '<div class= "bubble" id="' + bubble_name + '" style="position:absolute;z-index:5; left:' + left + 'px; top:' + top + 'px;">';
  }
  else {
    html_str  = '<div class= "bubble top" id="' + bubble_name + '" style="position:absolute;z-index:5; left:' + left + 'px; top:' + top + 'px;">';
  }

  // Insert bubble inner contents:
  html_str += innerHTML;

  // Close div tag:
  html_str += '</div>';
  
  // Insert bubble into the DOM tree:
  $('#'+dom_attach).append(html_str);
  
  // Place bubble in the right location taking into account the rendered size and the location of the arrow
  if(top > 214) {  
    h = $('#'+bubble_name).height();
    document.getElementById(bubble_name).style.top = (top-h-80) + 'px';
  }
  else {
    document.getElementById(bubble_name).style.top = (top) + 'px';
  }

  return bubble_name;
}

// This function creates the close button at the top-right corner of the 
// popup bubble. Inputs are the dom_bubble name (returned from 
// CreatePopupBubble()) and (optionally) a function to run when the close
// button is pressed.
function CreatePopupBubbleCloseButton(dom_bubble,close_function) {
  if(arguments.length==1) {
    close_function = function() {return;};
  }
  var html_str = '<img id="' + dom_bubble + '_closebutton" style="border: 0pt none; width:14px; height:14px; z-index:4; -moz-user-select:none; position:absolute; cursor:pointer; right:8px; top: 8px;" src="Icons/close.png" height="14" width="14" />';
  $('#'+dom_bubble).append(html_str);
  $('#'+dom_bubble+'_closebutton').mousedown(function () {
    $('#'+dom_bubble).remove();
    close_function();
    return;
  });
}


// *******************************************
// All functions below here need to be moved to their appropriate module:
// *******************************************

// THINGS THAT WILL BE GOOD TO SIMPLIFY:
//  1- why are there two functions -almost-identical- to close the bubble?
//  2- why is different the way the data is submitted in edit and query? I think with LM_xml data handling this will be simplified.
//  3- I want functions
//        LM_xml.store(obj_index, fieldname, value)
//        LM_xml.getvalue(obj_index, fieldname)
//        LM_xml.sendtoserver
//

// Query popup bubble:
function mkPopup(left,top) {
  wait_for_input = 1;
  var innerHTML = GetPopupFormDraw();
  CreatePopupBubble(left,top,innerHTML,'main_section');

  // Focus the cursor inside the box
  document.getElementById('objEnter').focus();
  document.getElementById('objEnter').select();
}

function mkEditPopup(left,top,anno) {
  edit_popup_open = 1;
  var innerHTML = GetPopupFormEdit(anno);
  var dom_bubble = CreatePopupBubble(left,top,innerHTML,'main_section');
  CreatePopupBubbleCloseButton(dom_bubble,StopEditEvent);

  // Focus the cursor inside the box
  document.getElementById('objEnter').focus();
  document.getElementById('objEnter').select();
}

function CloseQueryPopup() {
  wait_for_input = 0;
  var p = document.getElementById('myPopup');
  p.parentNode.removeChild(p);
}

function CloseEditPopup() {
  edit_popup_open = 0;
  var p = document.getElementById('myPopup');
  if(p) p.parentNode.removeChild(p);
}

// ****************************
// Forms:
// ****************************

function GetPopupFormDraw() {
  html_str = "<b>What aspect of the photograph did you select?</b><br />";
  html_str += HTMLobjectBox("");
  
  if(use_attributes) {
    html_str += HTMLimageDecadeBox("");
    html_str += HTMLimageQualityBox("");
    
    //html_str += "<b>Enter attributes</b><br />";
    //html_str += HTMLattributesBox("");
  }
  
  if(use_parts) {
    html_str += HTMLpartsBox("");
  }
  
  html_str += "<br />";
  
  // Done button:
  html_str += '<input type="button" value="Done" title="Press this button after you have provided all the information you want about the object." onclick="main_handler.SubmitQuery();" tabindex="0" />';
  
  // Undo close button:
  html_str += '<input type="button" value="Undo close" title="Press this button if you accidentally closed the polygon. You can continue adding control points." onclick="UndoCloseButton();" tabindex="0" />';
  
  // Delete button:
  html_str += '<input type="button" value="Delete" title="Press this button if you wish to delete the polygon." onclick="main_handler.WhatIsThisObjectDeleteButton();" tabindex="0" />';
  
  return html_str;
}

function GetPopupFormEdit(anno) {
  // get object name and attributes from 'anno'
  var obj_name = anno.GetObjName();
  if(obj_name=="") obj_name = "?";
  //var attributes = anno.GetAttributes();
  var imageDecade = anno.GetimageDecade();
  var imageQuality = anno.GetimageQuality();
  var parts = anno.GetParts();
  
  html_str = "<b>What aspect of the photograph did you select?</b><br />";
  html_str += HTMLobjectBox(obj_name);
  
  if(use_attributes) {
    html_str += HTMLimageDecadeBox(imageDecade);
    html_str += HTMLimageQualityBox(imageQuality);
    //html_str += "<b>Enter attributes</b><br />";
    //html_str += HTMLattributesBox(attributes);
  }
  
  if(use_parts) {
    html_str += HTMLpartsBox(parts);
  }
  
  html_str += "<br />";
  
  // Done button:
  html_str += '<input type="button" value="Done" title="Press this button when you are done editing." onclick="main_handler.SubmitEditLabel();" tabindex="0" />';
  
  /*************************************************************/
  /*************************************************************/
  // Scribble: if anno.GetType() != 0 then scribble mode:

  // Adjust polygon button:
  if (anno.GetType() == 0) {
    //html_str += '<input type="button" value="Adjust polygon" title="Press this button if you wish to update the polygon\'s control points." onclick="javascript:AdjustPolygonButton();" />';
    html_str += '<input type="button" value="Adjust polygon" title="Press this button if you wish to update the polygon\'s control points." onclick="AdjustPolygonButton();" />';
  }
  else {
  //html_str += '<input type="button" value="Edit Scribbles" title="Press this button if you wish to update the segmentation." onclick="javascript:EditBubbleEditScribble();" />';  
  html_str += '<input type="button" value="Edit Scribbles" title="Press this button if you wish to update the segmentation." onclick="EditBubbleEditScribble();" />';  
}
/*************************************************************/
/*************************************************************/

  // Delete button:
  html_str += '<input type="button" value="Delete" title="Press this button if you wish to delete the polygon." onclick="main_handler.EditBubbleDeleteButton();" tabindex="0" />';
  
  return html_str;
}

// ****************************
// Simple building blocks:
// ****************************

// Shows the box to enter the object name
function HTMLobjectBox(obj_name) {
  var html_str="";
  
  html_str += '<input name="objEnter" id="objEnter" type="text" style="width:220px;" tabindex="0" value="'+obj_name+'" title="Enter the name of the part of the photograph you selected (ex: smile, pose, tie). Avoid application specific names, codes, long descriptions. Use a name you think other people would agree in using. "';
  
  html_str += ' onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13)';

  // if obj_name is empty it means that the box is being created
  if (obj_name=='') {
    // If press enter, then submit; if press ESC, then delete:
    html_str += 'main_handler.SubmitQuery();if(c==27)main_handler.WhatIsThisObjectDeleteButton();" ';
  }
  else {
    // If press enter, then submit:
    html_str += 'main_handler.SubmitEditLabel();" ';
  }
  
  // if there is a list of objects, we need to habilitate the list
  if(object_choices=='...') {
    html_str += '/>'; // close <input
  }
  else {
    html_str += 'list="datalist1" />'; // insert list and close <input
    html_str += '<datalist id="datalist1"><select style="display:none">';
    for(var i = 0; i < object_choices.length; i++) {
      html_str += '<option value="' + object_choices[i] + '">' + object_choices[i] + '</option>';
    }
    html_str += '</select></datalist>';
  }
  
  html_str += '<br />';
  
  return html_str;
}



// ****************************
// Decade:
// ****************************
// ?decade: 1900s, etc.

// What decade do you think the image was taken
function HTMLimageDecadeBox(imageDecade) {
  var html_decade="";
  
  // by default, the value of imageDecade is "1900"
  if (!(imageDecade=="1900s" || imageDecade=="1910s" || imageDecade=="1920s"|| imageDecade=="1930s"|| imageDecade=="1940s"|| imageDecade=="1950s"|| imageDecade=="1960s"|| imageDecade=="1970s"|| imageDecade=="1980s"|| imageDecade=="1990s"|| imageDecade=="2000s"|| imageDecade=="2010s")) {
    imageDecade="1900s";
  }
  
  // the value of the selection is inside a hidden field:
  html_decade += 'In what decade do you think this image was taken? <input type="hidden" name="imageDecade" id="imageDecade" value="'+imageDecade+'"/>';
  
  // generate radio button
  if (imageDecade='1900s'){
   html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1900s" checked="yes" onclick="document.getElementById(\'imageDecade\').value=\'1900s\';" />1900s';
   html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1910s"  onclick="document.getElementById(\'imageDecade\').value=\'1910s\';" />1910s';
   html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1920s"  onclick="document.getElementById(\'imageDecade\').value=\'1920s\';" />1920s';
   html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1930s"  onclick="document.getElementById(\'imageDecade\').value=\'1930s\';" />1930s';
   html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1940s"  onclick="document.getElementById(\'imageDecade\').value=\'1940s\';" />1940s';
   html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1950s"  onclick="document.getElementById(\'imageDecade\').value=\'1950s\';" />1950s';
   html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1960s"  onclick="document.getElementById(\'imageDecade\').value=\'1960s\';" />1960s';
   html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1970s"  onclick="document.getElementById(\'imageDecade\').value=\'1970s\';" />1970s';
   html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1980s"  onclick="document.getElementById(\'imageDecade\').value=\'1980s\';" />1980s';
   html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1990s"  onclick="document.getElementById(\'imageDecade\').value=\'1990s\';" />1990s';
   html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2000s"  onclick="document.getElementById(\'imageDecade\').value=\'2000s\';" />2000s';
   html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2010s"  onclick="document.getElementById(\'imageDecade\').value=\'2010s\';" />2010s';
 }

  else if (imageDecade='1910s'){
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1900s"  onclick="document.getElementById(\'imageDecade\').value=\'1900s\';" />1900s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1910s" checked="yes"  onclick="document.getElementById(\'imageDecade\').value=\'1910s\';" />1910s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1920s"  onclick="document.getElementById(\'imageDecade\').value=\'1920s\';" />1920s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1930s"  onclick="document.getElementById(\'imageDecade\').value=\'1930s\';" />1930s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1940s"  onclick="document.getElementById(\'imageDecade\').value=\'1940s\';" />1940s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1950s"  onclick="document.getElementById(\'imageDecade\').value=\'1950s\';" />1950s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1960s"  onclick="document.getElementById(\'imageDecade\').value=\'1960s\';" />1960s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1970s"  onclick="document.getElementById(\'imageDecade\').value=\'1970s\';" />1970s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1980s"  onclick="document.getElementById(\'imageDecade\').value=\'1980s\';" />1980s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1990s"  onclick="document.getElementById(\'imageDecade\').value=\'1990s\';" />1990s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2000s"  onclick="document.getElementById(\'imageDecade\').value=\'2000s\';" />2000s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2010s"  onclick="document.getElementById(\'imageDecade\').value=\'2010s\';" />2010s';
  }
  else if (imageDecade=='1920s') {
    //figure out this line of code below. exacly what does yes mean?
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1900s"  onclick="document.getElementById(\'imageDecade\').value=\'1900s\';" />1900s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1910s"  onclick="document.getElementById(\'imageDecade\').value=\'1910s\';" />1910s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1920s" checked="yes"onclick="document.getElementById(\'imageDecade\').value=\'1920s\';" />1920s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1930s"  onclick="document.getElementById(\'imageDecade\').value=\'1930s\';" />1930s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1940s"  onclick="document.getElementById(\'imageDecade\').value=\'1940s\';" />1940s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1950s"  onclick="document.getElementById(\'imageDecade\').value=\'1950s\';" />1950s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1960s"  onclick="document.getElementById(\'imageDecade\').value=\'1960s\';" />1960s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1970s"  onclick="document.getElementById(\'imageDecade\').value=\'1970s\';" />1970s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1980s"  onclick="document.getElementById(\'imageDecade\').value=\'1980s\';" />1980s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1990s"  onclick="document.getElementById(\'imageDecade\').value=\'1990s\';" />1990s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2000s"  onclick="document.getElementById(\'imageDecade\').value=\'2000s\';" />2000s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2010s"  onclick="document.getElementById(\'imageDecade\').value=\'2010s\';" />2010s';
  }
  else if (imageDecade=='1930s') {
    //figure out this line of code below. exacly what does yes mean?
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1900s"  onclick="document.getElementById(\'imageDecade\').value=\'1900s\';" />1900s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1910s"  onclick="document.getElementById(\'imageDecade\').value=\'1910s\';" />1910s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1920s"  onclick="document.getElementById(\'imageDecade\').value=\'1920s\';" />1920s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1930s"  checked="yes" onclick="document.getElementById(\'imageDecade\').value=\'1930s\';" />1930s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1940s"  onclick="document.getElementById(\'imageDecade\').value=\'1940s\';" />1940s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1950s"  onclick="document.getElementById(\'imageDecade\').value=\'1950s\';" />1950s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1960s"  onclick="document.getElementById(\'imageDecade\').value=\'1960s\';" />1960s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1970s"  onclick="document.getElementById(\'imageDecade\').value=\'1970s\';" />1970s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1980s"  onclick="document.getElementById(\'imageDecade\').value=\'1980s\';" />1980s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1990s"  onclick="document.getElementById(\'imageDecade\').value=\'1990s\';" />1990s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2000s"  onclick="document.getElementById(\'imageDecade\').value=\'2000s\';" />2000s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2010s"  onclick="document.getElementById(\'imageDecade\').value=\'2010s\';" />2010s';
  }
  else if (imageDecade=='1940s') {
    //figure out this line of code below. exacly what does yes mean?
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1900s"  onclick="document.getElementById(\'imageDecade\').value=\'1900s\';" />1900s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1910s"  onclick="document.getElementById(\'imageDecade\').value=\'1910s\';" />1910s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1920s"  onclick="document.getElementById(\'imageDecade\').value=\'1920s\';" />1920s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1930s"  onclick="document.getElementById(\'imageDecade\').value=\'1930s\';" />1930s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1940s"  checked="yes" onclick="document.getElementById(\'imageDecade\').value=\'1940s\';" />1940s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1950s"  onclick="document.getElementById(\'imageDecade\').value=\'1950s\';" />1950s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1960s"  onclick="document.getElementById(\'imageDecade\').value=\'1960s\';" />1960s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1970s"  onclick="document.getElementById(\'imageDecade\').value=\'1970s\';" />1970s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1980s"  onclick="document.getElementById(\'imageDecade\').value=\'1980s\';" />1980s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1990s"  onclick="document.getElementById(\'imageDecade\').value=\'1990s\';" />1990s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2000s"  onclick="document.getElementById(\'imageDecade\').value=\'2000s\';" />2000s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2010s"  onclick="document.getElementById(\'imageDecade\').value=\'2010s\';" />2010s';
  }
  else if (imageDecade=='1950s') {
    //figure out this line of code below. exacly what does yes mean?
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1900s"  onclick="document.getElementById(\'imageDecade\').value=\'1900s\';" />1900s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1910s"  onclick="document.getElementById(\'imageDecade\').value=\'1910s\';" />1910s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1920s"  onclick="document.getElementById(\'imageDecade\').value=\'1920s\';" />1920s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1930s"  onclick="document.getElementById(\'imageDecade\').value=\'1930s\';" />1930s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1940s"  onclick="document.getElementById(\'imageDecade\').value=\'1940s\';" />1940s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1950s"  checked="yes" onclick="document.getElementById(\'imageDecade\').value=\'1950s\';" />1950s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1960s"  onclick="document.getElementById(\'imageDecade\').value=\'1960s\';" />1960s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1970s"  onclick="document.getElementById(\'imageDecade\').value=\'1970s\';" />1970s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1980s"  onclick="document.getElementById(\'imageDecade\').value=\'1980s\';" />1980s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1990s"  onclick="document.getElementById(\'imageDecade\').value=\'1990s\';" />1990s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2000s"  onclick="document.getElementById(\'imageDecade\').value=\'2000s\';" />2000s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2010s"  onclick="document.getElementById(\'imageDecade\').value=\'2010s\';" />2010s';
  }
  else if (imageDecade=='1960s') {
    //figure out this line of code below. exacly what does yes mean?
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1900s"  onclick="document.getElementById(\'imageDecade\').value=\'1900s\';" />1900s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1910s"  onclick="document.getElementById(\'imageDecade\').value=\'1910s\';" />1910s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1920s"  onclick="document.getElementById(\'imageDecade\').value=\'1920s\';" />1920s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1930s"  onclick="document.getElementById(\'imageDecade\').value=\'1930s\';" />1930s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1940s"  onclick="document.getElementById(\'imageDecade\').value=\'1940s\';" />1940s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1950s"  onclick="document.getElementById(\'imageDecade\').value=\'1950s\';" />1950s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1960s"  checked="yes" onclick="document.getElementById(\'imageDecade\').value=\'1960s\';" />1960s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1970s"  onclick="document.getElementById(\'imageDecade\').value=\'1970s\';" />1970s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1980s"  onclick="document.getElementById(\'imageDecade\').value=\'1980s\';" />1980s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1990s"  onclick="document.getElementById(\'imageDecade\').value=\'1990s\';" />1990s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2000s"  onclick="document.getElementById(\'imageDecade\').value=\'2000s\';" />2000s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2010s"  onclick="document.getElementById(\'imageDecade\').value=\'2010s\';" />2010s';
  }
  else if (imageDecade=='1970s') {
    //figure out this line of code below. exacly what does yes mean?
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1900s"  onclick="document.getElementById(\'imageDecade\').value=\'1900s\';" />1900s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1910s"  onclick="document.getElementById(\'imageDecade\').value=\'1910s\';" />1910s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1920s"  onclick="document.getElementById(\'imageDecade\').value=\'1920s\';" />1920s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1930s"  onclick="document.getElementById(\'imageDecade\').value=\'1930s\';" />1930s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1940s"  onclick="document.getElementById(\'imageDecade\').value=\'1940s\';" />1940s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1950s"  onclick="document.getElementById(\'imageDecade\').value=\'1950s\';" />1950s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1960s"  onclick="document.getElementById(\'imageDecade\').value=\'1960s\';" />1960s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1970s"  checked="yes" onclick="document.getElementById(\'imageDecade\').value=\'1970s\';" />1970s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1980s"  onclick="document.getElementById(\'imageDecade\').value=\'1980s\';" />1980s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1990s"  onclick="document.getElementById(\'imageDecade\').value=\'1990s\';" />1990s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2000s"  onclick="document.getElementById(\'imageDecade\').value=\'2000s\';" />2000s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2010s"  onclick="document.getElementById(\'imageDecade\').value=\'2010s\';" />2010s';
  }
  else if (imageDecade=='1980s') {
    //figure out this line of code below. exacly what does yes mean?
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1900s"  onclick="document.getElementById(\'imageDecade\').value=\'1900s\';" />1900s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1910s"  onclick="document.getElementById(\'imageDecade\').value=\'1910s\';" />1910s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1920s"  onclick="document.getElementById(\'imageDecade\').value=\'1920s\';" />1920s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1930s"  onclick="document.getElementById(\'imageDecade\').value=\'1930s\';" />1930s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1940s"  onclick="document.getElementById(\'imageDecade\').value=\'1940s\';" />1940s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1950s"  onclick="document.getElementById(\'imageDecade\').value=\'1950s\';" />1950s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1960s"  onclick="document.getElementById(\'imageDecade\').value=\'1960s\';" />1960s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1970s"  onclick="document.getElementById(\'imageDecade\').value=\'1970s\';" />1970s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1980s"  checked="yes" onclick="document.getElementById(\'imageDecade\').value=\'1980s\';" />1980s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1990s"  onclick="document.getElementById(\'imageDecade\').value=\'1990s\';" />1990s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2000s"  onclick="document.getElementById(\'imageDecade\').value=\'2000s\';" />2000s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2010s"  onclick="document.getElementById(\'imageDecade\').value=\'2010s\';" />2010s';
  }
  else if (imageDecade=='1990s') {
    //figure out this line of code below. exacly what does yes mean?
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1900s"  onclick="document.getElementById(\'imageDecade\').value=\'1900s\';" />1900s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1910s"  onclick="document.getElementById(\'imageDecade\').value=\'1910s\';" />1910s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1920s"  onclick="document.getElementById(\'imageDecade\').value=\'1920s\';" />1920s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1930s"  onclick="document.getElementById(\'imageDecade\').value=\'1930s\';" />1930s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1940s"  onclick="document.getElementById(\'imageDecade\').value=\'1940s\';" />1940s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1950s"  onclick="document.getElementById(\'imageDecade\').value=\'1950s\';" />1950s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1960s"  onclick="document.getElementById(\'imageDecade\').value=\'1960s\';" />1960s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1970s"  onclick="document.getElementById(\'imageDecade\').value=\'1970s\';" />1970s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1980s"  onclick="document.getElementById(\'imageDecade\').value=\'1980s\';" />1980s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1990s"  checked="yes" onclick="document.getElementById(\'imageDecade\').value=\'1990s\';" />1990s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2000s"  onclick="document.getElementById(\'imageDecade\').value=\'2000s\';" />2000s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2010s"  onclick="document.getElementById(\'imageDecade\').value=\'2010s\';" />2010s';
  }
  else if (imageDecade=='2000s') {
    //figure out this line of code below. exacly what does yes mean?
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1900s"  onclick="document.getElementById(\'imageDecade\').value=\'1900s\';" />1900s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1910s"  onclick="document.getElementById(\'imageDecade\').value=\'1910s\';" />1910s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1920s"  onclick="document.getElementById(\'imageDecade\').value=\'1920s\';" />1920s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1930s"  onclick="document.getElementById(\'imageDecade\').value=\'1930s\';" />1930s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1940s"  onclick="document.getElementById(\'imageDecade\').value=\'1940s\';" />1940s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1950s"  onclick="document.getElementById(\'imageDecade\').value=\'1950s\';" />1950s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1960s"  onclick="document.getElementById(\'imageDecade\').value=\'1960s\';" />1960s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1970s"  onclick="document.getElementById(\'imageDecade\').value=\'1970s\';" />1970s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1980s"  onclick="document.getElementById(\'imageDecade\').value=\'1980s\';" />1980s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1990s"  onclick="document.getElementById(\'imageDecade\').value=\'1990s\';" />1990s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2000s"  checked="yes" onclick="document.getElementById(\'imageDecade\').value=\'2000s\';" />2000s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2010s"  onclick="document.getElementById(\'imageDecade\').value=\'2010s\';" />2010s';
  }
  else {
    //figure out this line of code below. exacly what does yes mean?
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1900s"  onclick="document.getElementById(\'imageDecade\').value=\'1900s\';" />1900s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1910s"  onclick="document.getElementById(\'imageDecade\').value=\'1910s\';" />1910s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1920s"  onclick="document.getElementById(\'imageDecade\').value=\'1920s\';" />1920s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1930s"  onclick="document.getElementById(\'imageDecade\').value=\'1930s\';" />1930s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1940s"  onclick="document.getElementById(\'imageDecade\').value=\'1940s\';" />1940s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1950s"  onclick="document.getElementById(\'imageDecade\').value=\'1950s\';" />1950s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1960s"  onclick="document.getElementById(\'imageDecade\').value=\'1960s\';" />1960s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1970s"  onclick="document.getElementById(\'imageDecade\').value=\'1970s\';" />1970s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1980s"  onclick="document.getElementById(\'imageDecade\').value=\'1980s\';" />1980s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="1990s"  onclick="document.getElementById(\'imageDecade\').value=\'1990s\';" />1990s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2000s"  onclick="document.getElementById(\'imageDecade\').value=\'2000s\';" />2000s';
    html_decade += '<input type="radio" name="rbimageDecade" id="rbimageDecade" value="2010s"  checked="yes" onclick="document.getElementById(\'imageDecade\').value=\'2010s\';" />2010s';
  }
   return html_decade;
}

/*
function HTMLimageDecadeBox(imageDecade) {
  var html_decade="";
  html_decade += 'In what decade do you think this image was taken? <input type="hidden" name="imageDecade" id="imageDecade" value="'+imageDecade+'"/>';
  <select id="decadeSelect">
  <option value="1900">1900s</option>
  <option value= "1910">1910s</option>
  </select>
  html_decade += document.getElementById("decadeSelect").value;
  html_decade += '<br />';
  return html_decade;
}
*/

// ****************************
// ATTRIBUTES:
// ****************************
// ?attributes=object:car;brand:seat/ford;color:...;comments:...

// is the object's image quality what gives away the decade??
function HTMLimageQualityBox(imageQuality) {
  var html_str="";
  
  // by default, the value of imageQuality is "no"
  if (!(imageQuality=="no" || imageQuality=="yes")) {
    imageQuality="no";
  }
  
  // the value of the selection is inside a hidden field:
  html_str += 'Does the image quality aid you in determining the decade? <input type="hidden" name="imageQuality" id="imageQuality" value="'+imageQuality+'"/>';
  
  // generate radio button
  if (imageQuality=='yes') {
    html_str += '<input type="radio" name="rbimageQuality" id="rbimageQuality" value="yes" checked="yes" onclick="document.getElementById(\'imageQuality\').value=\'yes\';" />yes';
    html_str += '<input type="radio" name="rbimageQuality" id="rbimageQuality" value="no"  onclick="document.getElementById(\'imageQuality\').value=\'no\';" />no';
  }
  else {
    html_str += '<input type="radio" name="rbimageQuality" id="rbimageQuality" value="yes"  onclick="document.getElementById(\'imageQuality\').value=\'yes\';" />yes';
    html_str += '<input type="radio" name="rbimageQuality" id="rbimageQuality" value="no" checked="yes"  onclick="document.getElementById(\'imageQuality\').value=\'no\';" />no';
  }

  html_str += '<br />';
  
  return html_str;
}

// Boxes to enter attributes
//function HTMLattributesBox(attList) {    
 // return '<textarea name="attributes" id="attributes" type="text" style="width:220px; height:3em;" tabindex="0" title="Enter a comma separated list of attributes, adjectives or other object properties">'+attList+'</textarea>';
//}


// ****************************
// PARTS:
// ****************************
function HTMLpartsBox(parts) {
  var html_str="";
  if (parts.length>0) {
    if (parts.length==1) {
      html_str = 'Object has 1 part.';
    }
    else {
      html_str = 'Object has '+parts.length+' parts.';
    }
  }
  else {
    html_str = 'Object has no parts (you can add parts using the right panel).';
  }
  
  return html_str;
}
