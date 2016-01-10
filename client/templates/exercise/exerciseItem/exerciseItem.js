Template.exerciseItem.helpers({
  editorOptions: function() {
      return {
        lineNumbers: true,
        mode: "javascript",
        lineWrapping: true
      }
    },
  editorCode: function() {
    return "Code to show in editor";
  },
  item: function(){
    return getExercise();
  },
  exercises: function() {
  	return Exercises.find({name: FlowRouter.current().params.name});
  },
  prevURL: function() {
   return Session.get('prevURL');
  },
  nextURL: function() {
   return Session.get('nextURL');
  }
});

Meteor.startup(function () {
  allExercises = Exercises.find({}, { fields: {"name":1, "section":1} }).fetch();
  for(i=0; i<allExercises.length; i++) {
    allExercises[i].index = i;
  }
});

function queryString(n) {
  var query = "/exercises/" + allExercises[n].section + "/" + allExercises[n].name;
  return query;
}

Template.exerciseItem.rendered = function () {
  var currentExercise = _.find(allExercises, function(x) {
    return x.name == FlowRouter.current().params.name;
  });
  var currentIndex = currentExercise.index;
  currentIndex !== 0 ? Session.set('prevURL', queryString(currentIndex - 1)) : Session.set('prevURL', '/');
  currentIndex !== 58 ? Session.set('nextURL', queryString(currentIndex + 1) ) : Session.set('nextURL', '/');

 Tracker.autorun(function(){
   session_set();
 });
}

Template.exerciseItem.events({
  "getEditorText": function() {
    return Session.get("varName"); // "varName" is variable name you provided to reactiveVar
  },
  'keypress #code-mirror': function(e) {
    if(e.keyCode != 13)
      return;
    run(getExercise());
  },
  'click #run': function(){
    run(getExercise());
  },
  'click #help': function(){
    Session.set("postList", this._id);
  },
  'click .previous': function(){
   window.location.assign(Session.get('prevURL'));
  },
  'click .next': function(){
   window.location.assign(Session.get('nextURL'));
  }

});

var enclose = function(functionString){
  return eval(functionString);
}

var getExercise = function(){
  return Exercises.findOne({name: FlowRouter.current().params.name});
}

var session_set = function(){
  Session.set('success', null);
  Session.set('failure', null);
  Session.set("varName", getExercise().setup);
}

var abiShake = function(){
  $('h1.animated').toggleClass('shake');
}

var run = function(self){
  try{
    var obj = eval(Session.get("varName"));
  }
  catch(e){
    console.log("it crashed!");
    console.log(e);
  }
  var obj = eval(Session.get("varName"));
  var solutionIndex = 1;
  $(".rotate").toggleClass("down");

  var index = 0;
  for( ; index < self.inputs.length; ++index){
    var userOutput = eval(self.name + self.inputs[index]);
    var output = eval("solutions." + self.name + self.inputs[index]);

    if(output == userOutput){
      var currentDiv = $("tr.colors:nth-child("+(index + 1)+")").css("background-color", "#00b359");

      solutionIndex++;
      currentDiv.html("<td>"+self.name+self.inputs[index]+"</td><i class='fa fa-long-arrow-right'></i><td>"+ output +"</td><i class='fa fa-smile-o'></i><td>"+ userOutput + "</td>" );
    }
    else{
      var currentDiv = $("tr.colors:nth-child("+(index+1)+")").css("background-color", "#ff704d");
      currentDiv.html("<td>"+self.name+self.inputs[index]+"</td><i class='fa fa-long-arrow-right'></i><td>"+ output +"</td><i class='fa fa-smile-o'></i><td>"+ userOutput + "</td>" );
      abiShake();
    }
  }

  if (solutionIndex == (index+1)){
    Session.set('failure', null);
    Session.set('success', getExercise()._id);
    Meteor.call("userUpdate", getExercise().name);

  }else{
    Session.set('success', null);
    Session.set('failure', getExercise()._id);
  }
}
