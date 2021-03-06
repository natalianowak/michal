(function() {
    var rectangle;
    var map;
    var infoWindow;
    var geocoder;
    var area;
    var price;
    var priceForArea = 1;// 1zl za km2
    var option1Value = 2;//wartosc 1 opcji
    var option2Value = 3;//wartosc 2 opcji
    var option3Value = 5;//wartosc 3 opcji

    function initMap() {
        moveRect(49.9685, 20.4303);
    }

    function countFinalPrice() {
        price = area * priceForArea;

        if ($('input[id^="option1"]').prop('checked')) {
            price = price + option1Value;
        }
        if ($('input[id^="option2"]').prop('checked')) {
            price = price + option2Value;
        }
        if ($('input[id^="option3"]').prop('checked')) {
            price = price + option3Value;
        }

        $('.price').text(price + 'zl / 15 dni');
    }

    /** @this {google.maps.Rectangle} */
    function showNewRect() {
        var bounds = rectangle.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();

        // North West
        var nw = new google.maps.LatLng(ne.lat(), sw.lng());
        // South East
        var se = new google.maps.LatLng(sw.lat(), ne.lng());

        var distance1 = google.maps.geometry.spherical.computeDistanceBetween(nw, ne) / 1000; //w km
        var distance2 = google.maps.geometry.spherical.computeDistanceBetween(ne, se) / 1000; //w km
        area = Math.round(distance1 * distance2); //Obliczenie pola powierzchni prostokąta w km2

        var contentString = '<b>Wielkosc zaznaczonego obszaru to:</b><br>' + area + ' km2' + '</br>';

        // Set the info window's content and position.
        infoWindow.setContent(contentString);
        infoWindow.setPosition(ne);

        infoWindow.open(map);



        // oblicz cene tylko za powierzchnie bez dodatkowych opcji
        countFinalPrice();
    }


    function moveRect(lat, lon) {
        var mapElement = document.getElementById('map');

        map = new google.maps.Map(mapElement, {
            center: {lat: lat, lng: lon},
            zoom: 9,
            styles: [
                {
                    "featureType": "all",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#021747"
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "lightness": "-9"
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text",
                    "stylers": [
                        {
                            "lightness": "100"
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "gamma": 0.01
                        },
                        {
                            "lightness": 20
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                        {
                            "saturation": -31
                        },
                        {
                            "lightness": -33
                        },
                        {
                            "weight": 2
                        },
                        {
                            "gamma": 0.8
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.icon",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "landscape",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "lightness": 30
                        },
                        {
                            "saturation": 30
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "saturation": 20
                        }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "lightness": 20
                        },
                        {
                            "saturation": -20
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "lightness": 10
                        },
                        {
                            "saturation": -30
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "saturation": 25
                        },
                        {
                            "lightness": 25
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": [
                        {
                            "lightness": -20
                        }
                    ]
                }
            ]
        });

        //GEOCODIFICACION
        geocoder = new google.maps.Geocoder();

        var bounds = {
            north: map.center.lat() + 0.1500,
            south: map.center.lat() - 0.1500,
            east: map.center.lng() + 0.2500,
            west: map.center.lng() - 0.2500
        };

        // Define the rectangle and set its editable property to true.
        rectangle = new google.maps.Rectangle({
            bounds: bounds,
            editable: true,
            draggable: true
        });

        rectangle.setMap(map);

        // Add an event listener on the rectangle.
        rectangle.addListener('bounds_changed', showNewRect);

        // Define an info window on the map.
        infoWindow = new google.maps.InfoWindow();

        showNewRect();
    }

    $(document).ready(function () {
        var addressInput = $("#address");

        addressInput.autocomplete({

            source: function (request, response) {
                geocoder.geocode({'address': request.term}, function (results, status) {
                    response($.map(results, function (item) {
                        return {
                            label: item.formatted_address,
                            value: item.formatted_address,
                            latitude: item.geometry.location.lat(),
                            longitude: item.geometry.location.lng()
                        }
                    }));
                })
            },

            select: function (event, ui) {
                $("#latitude").val(ui.item.latitude);
                $("#longitude").val(ui.item.longitude);
                var location = new google.maps.LatLng(ui.item.latitude, ui.item.longitude);
                map.setCenter(location);
                moveRect(ui.item.latitude, ui.item.longitude);
            }
        });


        //obslugiwanie dodatkowych opcji

        var optionClickedHandler = function () {
            countFinalPrice();
        };



        $('input[id^="option1"]').click(optionClickedHandler);
        $('input[id^="option2"]').click(optionClickedHandler);
        $('input[id^="option3"]').click(optionClickedHandler);

        initMap();

        //wysylanie formularzy
        function isOption(optionId) {
            if ($('input[id^=' + optionId + ']').prop('checked')) {
                return true;
            } else {
                return false;
            }
        }

        $("#send").on('click', function () {
            var currentDate = new Date();
            //do michala
            alert(currentDate + " " + "Wielkosc obszaru: " + area + " km2 " +
                "Koordynaty punktow: " + rectangle.getBounds() +
                ", Oplata za wybrany obszar: " + price + " zl " +
                ", Wybrane opcje:  " + "option1: " + isOption("option1") +
                ", option2: " + isOption("option2") +
                ", option3: " + isOption("option3")
            );
            //do uzytkownika
            alert("Zamowienie skanera zostalo przyjete " + currentDate + " " + "Wielkosc obszaru: " + area + " km2 " +
                ", Oplata za wybrany obszar: " + price + " zl "
            );
        });
    });
})();


