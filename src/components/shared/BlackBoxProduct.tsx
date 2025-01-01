import React from "react";
import "./BlackBoxProduct.css"; // Include this for styling

const BlackBoxProduct = ({ id, name, price, image, rating }: { id: string, name: string, price: number, image: string, rating: number }) => {
  return (
    <div className="product-card">
      <div className="product-image border-4 border-blue-600">
        <img src={image} alt={name} />
        <div className="product-price">${price}</div>
      </div>
      <div className="product-info">
        <h3>{name}</h3>
        <p>{`Rating: ${rating}★`}</p>
        <button className="shop-now-button">Shop Now</button>
      </div>
    </div>
  );
};

export default BlackBoxProduct;
