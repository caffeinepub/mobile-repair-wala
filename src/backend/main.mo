import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  type ProductId = Text;

  type Product = {
    id : ProductId;
    name : Text;
    category : Text;
    price : Nat;
    imageUrl : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  var nextProductId = 9;

  let products = Map.empty<ProductId, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let seedProducts = [
    {
      name = "Mobile Cover";
      category = "Accessories";
      price = 999;
      imageUrl = "https://smartfixmobilecare.com/api/assets/mobile_cover.jpg";
    },
    {
      name = "Tempered Glass";
      category = "Accessories";
      price = 299;
      imageUrl = "https://smartfixmobilecare.com/api/assets/tempered_glass.jpg";
    },
    {
      name = "Fast Charger";
      category = "Chargers";
      price = 1499;
      imageUrl = "https://smartfixmobilecare.com/api/assets/fast_charger.jpg";
    },
    {
      name = "Wireless Earphones";
      category = "Audio";
      price = 2999;
      imageUrl = "https://smartfixmobilecare.com/api/assets/wireless_earphones.jpg";
    },
    {
      name = "Bluetooth Speaker";
      category = "Audio";
      price = 3499;
      imageUrl = "https://smartfixmobilecare.com/api/assets/bluetooth_speaker.jpg";
    },
    {
      name = "Power Bank";
      category = "Chargers";
      price = 1999;
      imageUrl = "https://smartfixmobilecare.com/api/assets/power_bank.jpg";
    },
    {
      name = "Phone Holder";
      category = "Accessories";
      price = 699;
      imageUrl = "https://smartfixmobilecare.com/api/assets/phone_holder.jpg";
    },
    {
      name = "Data Cable";
      category = "Accessories";
      price = 399;
      imageUrl = "https://smartfixmobilecare.com/api/assets/data_cable.jpg";
    },
  ];

  for (i in seedProducts.keys()) {
    let product = {
      id = (i + 1).toText();
      name = seedProducts[i].name;
      category = seedProducts[i].category;
      price = seedProducts[i].price;
      imageUrl = seedProducts[i].imageUrl;
    };
    products.add(product.id, product);
  };

  let carts = Map.empty<Principal, [ProductId]>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management - Public Query
  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  // Product Management - Admin Only
  public shared ({ caller }) func addProduct(name : Text, category : Text, price : Nat, imageUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let id = nextProductId.toText();
    let product = {
      id;
      name;
      category;
      price;
      imageUrl;
    };

    products.add(id, product);
    nextProductId += 1;
    id;
  };

  public shared ({ caller }) func updateProduct(id : ProductId, name : Text, category : Text, price : Nat, imageUrl : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    let product = {
      id;
      name;
      category;
      price;
      imageUrl;
    };

    products.add(id, product);
    true;
  };

  public shared ({ caller }) func deleteProduct(id : ProductId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    products.remove(id);
    true;
  };

  // Cart Operations - Available to all users including guests (anonymous)
  public shared ({ caller }) func addToCart(productId : ProductId) : async Bool {
    switch (products.get(productId)) {
      case (null) {
        Runtime.trap("Product does not exist");
      };
      case (?_) {
        let currentCart = switch (carts.get(caller)) {
          case (null) { [] };
          case (?cart) { cart };
        };

        let newCart = currentCart.concat([productId]);
        carts.add(caller, newCart);
        true;
      };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : ProductId) : async Bool {
    switch (products.get(productId)) {
      case (null) {
        Runtime.trap("Product does not exist");
      };
      case (?_) {
        let currentCart = switch (carts.get(caller)) {
          case (null) {
            Runtime.trap("Cart is empty");
          };
          case (?cart) { cart };
        };

        let newCart = currentCart.filter(func(id) { id != productId });
        carts.add(caller, newCart);
        true;
      };
    };
  };

  public query ({ caller }) func getCartContents() : async [Product] {
    let cart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };

    cart.map(
      func(productId) {
        switch (products.get(productId)) {
          case (null) {
            Runtime.trap("Product not found in store");
          };
          case (?product) { product };
        };
      }
    );
  };

  public shared ({ caller }) func clearCart() : async Bool {
    carts.remove(caller);
    true;
  };
};
