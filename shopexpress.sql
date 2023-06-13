-- MySQL dump 10.13  Distrib 8.0.33, for macos13 (arm64)
--
-- Host: fsd08shopexpress.mysql.database.azure.com    Database: shopexpress
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cartitems`
--

DROP TABLE IF EXISTS `cartitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartitems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cartId` int NOT NULL,
  `productId` int NOT NULL,
  `productCode` varchar(45) DEFAULT NULL,
  `productName` varchar(45) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `amount` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cartId` (`cartId`) /*!80000 INVISIBLE */,
  KEY `productId` (`productId`),
  CONSTRAINT `cartItems_cartId` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`),
  CONSTRAINT `cartItems_productId` FOREIGN KEY (`productId`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sellerId` int NOT NULL,
  `buyerId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `buyerId` (`buyerId`) /*!80000 INVISIBLE */,
  KEY `sellerId` (`sellerId`),
  CONSTRAINT `carts_buyerId` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`),
  CONSTRAINT `carts_sellerId` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(45) NOT NULL,
  `data` mediumblob NOT NULL,
  `mimeType` varchar(45) NOT NULL,
  `productId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `productId_UNIQUE` (`productId`),
  KEY `productId` (`productId`),
  CONSTRAINT `fk_images_productId` FOREIGN KEY (`productId`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orderitems`
--

DROP TABLE IF EXISTS `orderitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderitems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `productId` int NOT NULL,
  `productCode` varchar(45) DEFAULT NULL,
  `productName` varchar(45) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `amount` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`) /*!80000 INVISIBLE */,
  KEY `productId` (`productId`),
  CONSTRAINT `orderItems_orderId` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`),
  CONSTRAINT `orderItems_productId` FOREIGN KEY (`productId`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sellerId` int NOT NULL,
  `buyerId` int NOT NULL,
  `status` enum('unSubmitted','BuyerConfirmed','Paid','SellerConfirmed','Transporting','Received','Canceled') NOT NULL DEFAULT 'unSubmitted',
  `orderTime` datetime DEFAULT NULL,
  `paymentInfo` varchar(45) DEFAULT NULL,
  `totalPrice` decimal(10,2) DEFAULT NULL,
  `taxes` decimal(10,2) DEFAULT NULL,
  `shippingFee` decimal(10,2) DEFAULT NULL,
  `finalTotalPay` decimal(10,2) DEFAULT NULL,
  `deliveryInfo` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `buyerId` (`buyerId`) /*!80000 INVISIBLE */,
  KEY `sellerId` (`sellerId`),
  CONSTRAINT `orders_buyerId` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_sellerId` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` enum('Fashion','Home','Beauty','Books','Electronic','Baby') DEFAULT NULL,
  `sellerId` int NOT NULL,
  `productCode` varchar(45) NOT NULL,
  `productName` varchar(45) NOT NULL,
  `productDesc` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stockNum` int DEFAULT NULL,
  `available` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `itemCode_UNIQUE` (`productCode`) /*!80000 INVISIBLE */,
  KEY `sellerId` (`sellerId`) /*!80000 INVISIBLE */,
  CONSTRAINT `products_sellerId` FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userName` varchar(45) NOT NULL,
  `password` varchar(300) DEFAULT NULL,
  `role` enum('seller','buyer','admin') DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userName_UNIQUE` (`userName`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-06-13 13:37:50
