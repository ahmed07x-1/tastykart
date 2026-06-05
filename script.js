const menuContainer = document.getElementById("menu-container");
const cartItemsContainer = document.getElementById("cart-items");
const totalItems = document.getElementById("total-items");
const totalPrice = document.getElementById("total-price");
const orderForm = document.getElementById("order-form");

let menu = [];
let cart = [];

// FETCH MENU USING AXIOS
async function fetchMenu() {
  try {
    const response = await axios.get(
      "https://tastykart-api.onrender.com/menu"
    );

    menu = response.data;
    displayMenu(menu);

  } catch (error) {
    console.log("Error fetching menu", error);
  }
}

// DISPLAY MENU
function displayMenu(items) {

  menuContainer.innerHTML = "";

  items.forEach((item) => {

    menuContainer.innerHTML += `
    
    <div class="col-md-6 col-lg-4">

      <div class="card h-100">

        <img 
          src="${item.image}" 
          class="card-img-top"
          alt="${item.name}"
        >

        <div class="card-body d-flex flex-column">

          <div class="d-flex justify-content-between">

            <h5 class="card-title">
              ${item.name}
            </h5>

            <span class="badge bg-danger">
              ${item.tag}
            </span>

          </div>

          <p class="card-text">
            ${item.description}
          </p>

          <h5 class="text-success">
            ₹${item.price}
          </h5>

          <button
            class="btn btn-warning mt-auto"
            onclick="addToCart(${item.id})"
          >
            Add To Cart
          </button>

        </div>

      </div>

    </div>
    `;
  });
}

// FILTER CATEGORY
document.querySelectorAll(".filter-btn")
  .forEach((button) => {

    button.addEventListener("click", () => {

      const category =
        button.dataset.category;

      if (category === "All") {
        displayMenu(menu);
      } else {

        const filteredMenu =
          menu.filter(
            (item) =>
              item.category === category
          );

        displayMenu(filteredMenu);
      }
    });
  });

// ADD TO CART
// ADD TO CART
function addToCart(id) {

  const selectedItem =
    menu.find(item => item.id == id);

  if (!selectedItem) {
    console.log("Item not found");
    return;
  }

  const existingItem =
    cart.find(item => item.id == id);

  if (existingItem) {

    existingItem.quantity++;

  } else {

    cart.push({
      ...selectedItem,
      quantity: 1
    });
  }

  updateCart();
}

// UPDATE CART
function updateCart() {

  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {

    cartItemsContainer.innerHTML =
      `<p class="text-center">
      No items in cart
      </p>`;

    totalItems.textContent = 0;
    totalPrice.textContent = 0;

    return;
  }

  let total = 0;
  let itemCount = 0;

  cart.forEach((item) => {

    total += item.price * item.quantity;
    itemCount += item.quantity;

    cartItemsContainer.innerHTML += `
    
    <div class="card p-3 mb-3">

      <div class="d-flex 
      justify-content-between
      align-items-center">

        <div>

          <h5>
            ${item.name}
          </h5>

          <p>
            ₹${item.price}
          </p>

        </div>

        <div>

          <button
            class="btn btn-danger btn-sm"
            onclick="decreaseQuantity(${item.id})"
          >
            -
          </button>

          <span class="mx-2">
            ${item.quantity}
          </span>

          <button
            class="btn btn-success btn-sm"
            onclick="increaseQuantity(${item.id})"
          >
            +
          </button>

        </div>

      </div>

    </div>
    `;
  });

  totalItems.textContent =
    itemCount;

  totalPrice.textContent =
    total;
}

// INCREASE QUANTITY
// INCREASE QUANTITY
function increaseQuantity(id) {

  const item = cart.find(
    item => item.id == id
  );

  if (item) {
    item.quantity++;
  }

  updateCart();
}

// DECREASE QUANTITY
function decreaseQuantity(id) {

  const item = cart.find(
    item => item.id == id
  );

  if (item) {

    if (item.quantity > 1) {

      item.quantity--;

    } else {

      cart = cart.filter(
        cartItem => cartItem.id != id
      );
    }
  }

  updateCart();
}

// PLACE ORDER
orderForm.addEventListener(
  "submit",
  async function (e) {

    e.preventDefault();

    const name =
      document.getElementById(
        "name"
      ).value.trim();

    const phone =
      document.getElementById(
        "phone"
      ).value.trim();

    const address =
      document.getElementById(
        "address"
      ).value.trim();

    // VALIDATION
    if (
      name === "" ||
      address === ""
    ) {

      alert(
        "Name and Address cannot be empty"
      );

      return;
    }

    if (
      isNaN(phone)
    ) {

      alert(
        "Phone number must be numeric"
      );

      return;
    }

    if (
      cart.length === 0
    ) {

      alert(
        "Cart is empty"
      );

      return;
    }

    const orderData = {
      customerName: name,
      phone,
      address,
      items: cart,
      total:
        totalPrice.textContent
    };

    try {

      await axios.post(
        "https://tastykart-api.onrender.com/orders",
        orderData
      );

      alert(
        "Your order has been placed!"
      );

      orderForm.reset();

      cart = [];

      updateCart();

    } catch (error) {

      console.log(
        "Order failed",
        error
      );
    }
  }
);

// INITIAL CALL
fetchMenu();