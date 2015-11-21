angular.module('RDash')
  .controller('userFavoritesController', function($scope, $http) {
    //check if user is logged in
    $scope.hideUserMenu = true;
    $scope.dataFav = [];
    $scope.dataCre = [];
    $http.get("/auth/user")
     .success(function(response){
       $scope.userJSON = response;
        if (response.profiles != null && response.profiles.length > 0){
          $scope.hideUserMenu = false;
        }
      });

      $http.get("/api/users/me/")
        .success(function(response) {
          $scope.me = response;
          if ($scope.me.favoriteDrinks == null) return;
          for(i = 0; i < $scope.me.favoriteDrinks.length; ++i){
            $http.get("/api/drinks/" + $scope.me.favoriteDrinks[i])
              .success(function(response) {
                $scope.dataFav.push(response);
            });
          }
        });
  });
