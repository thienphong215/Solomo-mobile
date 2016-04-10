angular.module('solomo.controllers')

.controller('MapCtrl', function ($scope, UserService,$ionicLoading, $state, $ionicModal, MapService) {

    //get options for map
    var lat = UserService.getLat();
    var long = UserService.getLong();

    var myLatlng = new google.maps.LatLng(lat, long);
    var mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var userMarker = new google.maps.Marker({
                map: map,
                animation: google.maps.Animation.FADE,
                position: myLatlng
    });

    //get feeds from localstorage
    //var feeds_load = UserService.getObject('feed');
    $scope.list = [];

    //load deals
    var changes = [];

    google.maps.event.addListenerOnce(map, 'idle', function(){
        loadfeeds();
    });

    map.addListener('dragend', function() {
        changes.push(1);
        setTimeout(function() {
            if (changes.length) {
                changes = [];
                loadfeeds();
            }
        }, 1000);
    });

    map.addListener('zoom_changed', function() {
        changes.push(1);
        setTimeout(function() {
            if (changes.length) {
                changes = [];
                loadfeeds();
            }
        }, 1000);
    });

    // $scope.nelat = 0;
    // $scope.nelng = 0;

    // map.addListener('idle', function() {
    //     var bounds =  map.getBounds();
    //     var ne = bounds.getNorthEast();
    //     $scope.nelat = ne.lat();
    //     $scope.nelng = ne.lng();
    // });

    var infowindow = new google.maps.InfoWindow();

    function attachSecretMessage(marker, feed) {
        console.log(feed);
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent('<p>'+feed.description+'</p>' +
                '<button class="button button-positive" onclick="OpenDetail('+feed.id+')">View detail</button>');
            infowindow.open(marker.get('map'), marker);
            map.panTo(marker.getPosition());
        });
    }

    OpenDetail = function(id){
        console.log(id);
        $scope.OpenDetail(id);
    };

    loadfeeds();
    function loadfeeds() {
        // console.log(map.getBounds);
        var bounds =  map.getBounds();
        if (bounds == null || typeof(bounds) == 'undefined') {
            return;
        }
        $ionicLoading.show();
        var ne = bounds.getNorthEast();
        var lat0 = ne.lat();
        var lng0 = ne.lng();
        var lat1 = map.getCenter().lat();
        var lng1 = map.getCenter().lng();
        console.log(lat0);
        radius = Math.sqrt((lat0-lat1)*(lat0-lat1)+(lng0-lng1)*(lng0-lng1));
        MapService.locate({
            params: {
                user_token: UserService.getUser().user_token,
                lat: map.getCenter().lat(),
                long: map.getCenter().lng(),
                radius: radius
            }
        }, function(success) {
            console.log(success);
            // setMapOnAll(null);
            pushfeeds(success.results);
        }, function(error) {
            console.log(error);
        });

    }

    function pushfeeds(feeds) {
        // console.log(feeds);
        console.log($scope.list);

        for(post in $scope.list){
            $scope.list[post].marker.setMap(null);
        }
        $scope.list = [];

        for(feed in feeds) {
            // console.log(feeds[feed].result_data);
            if (feeds[feed].result_data.lat == null || feeds[feed].result_data.long == null){
                continue;
            }

            // $scope.$apply();
            console.log("123123");
            var dealLatlng = new google.maps.LatLng(feeds[feed].result_data.lat, feeds[feed].result_data.long);
            var marker = new google.maps.Marker({
                map: map,
                animation: google.maps.Animation.FADE,
                position: dealLatlng,
                icon:"img/userMarker.png"
            });

            post = feeds[feed].result_data;
            post.marker = marker;
            post.OnClick = function(){
                infowindow.setContent(this.description);
                infowindow.open(map, this.marker);
                map.panTo(this.marker.getPosition());
            };
            $scope.list.push(post);

            attachSecretMessage(marker,feeds[feed].result_data);
        }
        $ionicLoading.hide();
    }
    
    //open detail post
    $scope.OpenDetail = function (viewId) {
        $scope.modal.hide();
        $state.go("tab.view-detail", {viewId: viewId})
    };

    $ionicModal.fromTemplateUrl('modal.html', function($ionicModal) {
        $scope.modal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });
});
