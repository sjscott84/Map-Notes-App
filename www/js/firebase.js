angular.module('starter')
	.factory("firebaseService", function(){

		var config = {
			apiKey: "AIzaSyAQchOOXdXejiMOcTKoj_w6hDbg-01m3jQ",
			authDomain: "map-notes-d1949.firebaseapp.com",
			databaseURL: "https://map-notes-d1949.firebaseio.com",
			storageBucket: "map-notes-d1949.appspot.com",
		};
		firebase.initializeApp(config);
		var database = firebase.database();

		return {
			savePlace: function(placeObject){
				database.ref('places/').push(placeObject);
			}
		}
	})