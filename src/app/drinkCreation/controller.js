angular.module('RDash')
  .controller('drinkCreationController', function($scope, $http) {
    //check if user is logged in
    $scope.hideUserMenu = false;
    $http.get("/auth/user")
      .success(function(response) {
        $scope.userJSON = response;
        if (response.profiles != null && response.profiles.length > 0) {
          $scope.hideUserMenu = false;
        }
      });
    $scope.currentUserId = -1;
    $http.get("/api/users/me/")
      .success(function(response) {
        $scope.currentUserId = response.id;
        $scope.drink.userId = response.id;
      });
    $scope.currentImage = "img/red-solo-cup.jpg";
    $scope.drink = {
      "name": "",
      "rating": 0,
      "instructions": "",
      "description": "",
      "userId": $scope.currentUserId,
      "color": "",
      "_amounts": []
    };
    $scope.image = {
      "file": "",
      "id": ""
    };
    $scope.add = {
      "text": "",
      "type": "",
      "liq": true
    };
    $scope.directionStep;
    $scope.newIngredient = [];
    $scope.directions = [];
    $scope.ingredients = [];
    $scope.drikPost = false;
    $scope.validType = true;
    $scope.validText = true;
    $http.get("/api/ingredients")
      .success(function(response) {
        $scope.dataIngredients = response;
      });


    $scope.submit = function() {
      var holdDirections = [];
      for (i = 0; i < $scope.directions.length; ++i) {
        holdDirections.push($scope.directions[i].text);
      }
      angular.forEach($scope.ingredients, function(ing, i) {
        $scope.drink._amounts.push({
          "ingredientID": ing.id,
          "amount": ing.amount,
          "unit": "oz",
          "id": i
        });
      });

      $scope.drink.photo = $scope.currentImage;
      $scope.drink.instructions = holdDirections;
      console.log($scope.drink);
      $http.put("/api/drinks", $scope.drink)
        .success(function(response) {
          for (i = 0; i < $scope.ingredients.length; ++i) {
            $http.put("/api/drinks/" + response.id + "/ingredients/rel/" + $scope.ingredients[i].id);
          }
          $scope.drinkPost = true;
        });
    };

    $scope.remove = function(item) {
      var index = $scope.ingredients.indexOf(item);
      if ($scope.newIngredient.indexOf(item) === -1) {
        $scope.dataIngredients.push($scope.ingredients[index]);
        $scope.ingredients.splice(index, 1);
      } else {
        $http.delete("/api/ingredients/" + item.id)
          .success(function(response) {
            $scope.ingredients.splice(index, 1);
          });
      }
    };

    $scope.addIng = function(item) {
      var index = $scope.dataIngredients.indexOf(item);
      var ing = $scope.dataIngredients[index];
      //ing.amount = 0;
      $scope.ingredients.push(ing);
      $scope.dataIngredients.splice(index, 1);
    };

    $scope.addStep = function() {
      if ($scope.directionStep && $scope.directionStep.length > 2 && $scope.directions.length < 10) {
        var hold = {
          "step": $scope.directions.length + 1,
          "text": $scope.directionStep
        };
        $scope.directions.push(hold);
        $scope.directionStep = "";
      }
    };

    $scope.removeStep = function(item) {
      var index = $scope.directions.indexOf(item);
      $scope.directions.splice(index, 1);
      for (i = index; i < $scope.directions.length; ++i) {
        $scope.directions[i].step--;
      }
    };

    $scope.onSuccess = function(response) {
      $scope.currentImage = response.data.result.url;
    };

    $scope.addIngredient = function() {
      var hold = {
        "text": $scope.add.text,
        "type": $scope.add.type,
        "isLiquid": $scope.add.liq
      }
      if (hold.text.length >= 3 && hold.type.length >= 3) {
        $scope.add.text = "";
        $scope.add.type = "";
        $scope.validType = true;
        $scope.validText = true;
        $scope.adding = false;
        $http.put("/api/ingredients", hold)
          .success(function(response) {
            $scope.ingredients.push(response);
            $scope.newIngredient.push(response);
          });
      } else {
        if (hold.text.length < 3) {
          $scope.validText = false;
        } else {
          $scope.validText = true;
        }
        if (hold.type.length < 3) {
          $scope.validType = false;
        } else {
          $scope.validText = true;
        }
      }
    };
  });
