/*globals Google, TasksList */

'use strict';

Google.init(
  '370558891874-tcji26dm7t571mgbl88phr42qdpbtluh.apps.googleusercontent.com'
, 'x0wjP4psSLwuGeQyYtQ37lNg'
, ['https://www.googleapis.com/auth/tasks']
);

Google.ready(function(){

  TasksList.list(function(err, items){
    console.log(items);
  });

});