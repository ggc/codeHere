var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

module.exports.locationsListByDistance = function (req, res) {
	var lng = parseFloat(req.query.lng);
	var lat = parseFloat(req.query.lat);
	var maxDistance = parseFloat(req.query.maxDistance); // meters
	var point = {
		type: "Point",
		coordinates: [lng, lat]
	};
	var geoOptions = {
		spherical: true,
		maxDistance: maxDistance,
		num: 10
	};
	//if (!lng || !lat) { // Because [0,0] is still a place to live.
	if((!lng && lng!==0) || (!lat && lat!==0)) {
		sendJSONResponse(res, 404, {
			"message" : "lng and lat query parameters are required"
		});
		return;
	}
	// Loc.geoNear===db.locations.geoNear(...) on db CLI
	Loc.geoNear(point, geoOptions, function (err, results, stats){
		var locations = [];
		if (err) {
			sendJSONResponse(res, 404, err);
		} else {
			console.log("maxDistance=" + maxDistance);
			results.forEach(function(doc) {
				console.log(doc.obj.name + " distance to point: " + doc.dis);
				locations.push({
					distance: doc.dis/1000, //TODO
					name: doc.obj.name,
					address: doc.obj.address,
					rating: doc.obj.rating,
					facilities: doc.obj.facilities,
					_id: doc.obj._id
				});
			});
			sendJSONResponse(res, 200, locations);
		}
	});
};

var theEarth = (function() {
	var earthRadius = 6371; //km

	// Specify the distance in meters for GeoJSON (this case) data 
	// and in radians for legacy coordinate pairs.
	// To use legacy pairs.
	var getDistanceFromRads = function(rads) {
		return parseFloat(rads * earthRadius);
	};

	var getRadsFromDistance = function(distance) {
		return parseFloat(distance / earthRadius);
	};

	return {
		getDistanceFromRads: getDistanceFromRads,
		getRadsFromDistance: getRadsFromDistance
	};
})();

var sendJSONResponse = function(res, status, content){
	res.status(status);
	res.json(content);
};


module.exports.locationsCreate = function (req, res) {
	// console.log(req.body.days1);
	Loc.create({
		name: req.body.name,
		address: req.body.address,
		facilities: req.body.facilities.split(","),
		coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
		openingTimes: [{
			days: req.body.days1,
			opening: req.body.opening1,
			closing: req.body.closing1,
			closed: req.body.closed1
		},{
			days: req.body.days2,
			opening: req.body.opening2,
			closing: req.body.closing2,
			closed: req.body.closed2
		}]
	}, function(err, location) {
		if (err) {
			sendJSONResponse(res, 400, err);
		} else {
			sendJSONResponse(res, 201, location);
		}
	});
};


module.exports.locationsReadOne = function (req, res) {
	if (req.params && req.params.locationid) {
		Loc
			.findById(req.params.locationid)
			.exec(function(err, location) {
				if (!location) {
					sendJSONResponse(res, 404, {
						"message" : "locationid not found"
					});
					return;
				} else if (err) {
					sendJSONResponse(res, 404, err);
					return;
				}
				sendJSONResponse(res, 200, location);
			});
	} else {
		sendJSONResponse(res, 404, {
			"message" : "No locationid in request"
		});
	}
};


module.exports.locationsUpdateOne = function (req, res) {
	if (!req.params.locationid) {
		sendJSONResponse(res, 404, {
			"messafe" :  "Not found, locationid is required"
		});
		return;
	}
	Loc
		.findById(req.params.locationid)
		.select('-reviews -rating')
		.exec(
			function(err, location) {
				if (!location) {
					sendJSONResponse(res, 404, {
						"message" : "locationid not found"
					});
					return;
				} else if (err) {
					sendJSONResponse(res, 400, err);
					return;
				}
				location.name = req.body.name;
				location.address = req.body.address;
				location.facilities = req.body.facilities.split(",");
				location.coords = [parseFloat(req.body.lng),
					parseFloat(req.body.lat)];
				location.openingTimes = [{
					days: req.body.days1,
					opening: req.body.opening1,
					closing: req.body.closing1,
					closed: req.body.closed1,
				}, {
					days: req.body.days2,
					opening: req.body.opening2,
					closing: req.body.closing2,
					closed: req.body.closed2,
				}];
				locatin.save(function(err, location) {
					if (err) {
						sendJSONResponse(res, 404, err);
					} else {
						sendJSONResponse(res, 200, location);
					}
				});
			}
		);
};


module.exports.locationsDeleteOne = function (req, res) {
	var locationid = req.params.locationid;
	  if (locationid) {
		  // Can be separated into .findById and .remove to operate in between
		Loc
		  .findByIdAndRemove(locationid)
		  .exec(
			function(err, location) {
			  if (err) {
				console.log(err);
				sendJSONresponse(res, 404, err);
				return;
			  }
			  console.log("Location id " + locationid + " deleted");
			  sendJSONresponse(res, 204, null);
			}
		);
	  } else {
		sendJSONresponse(res, 404, {
		  "message": "No locationid"
		});
	}
};
