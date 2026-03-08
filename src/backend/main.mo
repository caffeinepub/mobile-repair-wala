import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Principal "mo:core/Principal";

actor {
  type Product = {
    id : Text;
    name : Text;
    price : Nat;
    category : Text;
    imageUrl : Text;
  };

  module Product {
    public func fromText(text : Text) : Text {
      text;
    };
  };

  let products = Map.fromIter<Text, Product>(
    [
      (
        "1",
        {
          id = "1";
          name = "Mobile Cover";
          price = 299;
          category = "Accessories";
          imageUrl = "https://smartfixmobilecare.com/api/assets/mobile_cover.jpg";
        },
      ),
      (
        "2",
        {
          id = "2";
          name = "Tempered Glass";
          price = 199;
          category = "Accessories";
          imageUrl = "https://smartfixmobilecare.com/api/assets/tempered_glass.jpg";
        },
      ),
      (
        "3",
        {
          id = "3";
          name = "Fast Charger";
          price = 499;
          category = "Chargers";
          imageUrl = "https://smartfixmobilecare.com/api/assets/fast_charger.jpg";
        },
      ),
      (
        "4",
        {
          id = "4";
          name = "Wireless Earphones";
          price = 1499;
          category = "Audio";
          imageUrl = "https://smartfixmobilecare.com/api/assets/wireless_earphones.jpg";
        },
      ),
      (
        "5",
        {
          id = "5";
          name = "Bluetooth Speaker";
          price = 1999;
          category = "Audio";
          imageUrl = "https://smartfixmobilecare.com/api/assets/bluetooth_speaker.jpg";
        },
      ),
      (
        "6",
        {
          id = "6";
          name = "Power Bank";
          price = 1299;
          category = "Chargers";
          imageUrl = "https://smartfixmobilecare.com/api/assets/power_bank.jpg";
        },
      ),
      (
        "7",
        {
          id = "7";
          name = "Phone Holder";
          price = 399;
          category = "Accessories";
          imageUrl = "https://smartfixmobilecare.com/api/assets/phone_holder.jpg";
        },
      ),
      (
        "8",
        {
          id = "8";
          name = "Data Cable";
          price = 149;
          category = "Accessories";
          imageUrl = "https://smartfixmobilecare.com/api/assets/data_cable.jpg";
        },
      ),
    ].values(),
  );

  let carts = Map.empty<Principal, [Text]>();

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public shared ({ caller }) func addToCart(productId : Text) : async () {
    let productExists = products.containsKey(productId);
    if (not productExists) {
      Runtime.trap("Product does not exist");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };

    let newCart = currentCart.concat([productId]);
    carts.add(caller, newCart);
  };

  public shared ({ caller }) func removeFromCart(productId : Text) : async () {
    let productExists = products.containsKey(productId);
    if (not productExists) {
      Runtime.trap("Product does not exist");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) {
        Runtime.trap("Cart is empty");
      };
      case (?cart) { cart };
    };

    let newCart = currentCart.filter(func(id) { id != productId });
    carts.add(caller, newCart);
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
            Runtime.trap("Product does not exist");
          };
          case (?product) { product };
        };
      }
    );
  };

  public shared ({ caller }) func clearCart() : async () {
    carts.remove(caller);
  };
};
