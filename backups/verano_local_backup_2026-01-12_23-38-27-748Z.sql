-- MySQL dump - Backup de base de datos LOCAL
-- Host: localhost    Database: verano
-- ------------------------------------------------------
-- Fecha: 12/1/2026, 5:38:27 p. m.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
INSERT INTO `_prisma_migrations` (`id`,`checksum`,`finished_at`,`migration_name`,`logs`,`rolled_back_at`,`started_at`,`applied_steps_count`) VALUES ('7a7d809a-da41-4fa6-9a4e-84e401121ba3','ac1a531b470f465d4cf18fb9a9baa34e59fa99a45430a133db8ebbffc74460d1','2026-01-06 21:22:03','20260106152202_agregar_especificaciones_tecnicas_vehiculos',NULL,NULL,'2026-01-06 21:22:02',1);
UNLOCK TABLES;

--
-- Table structure for table `tblcommunities`
--

DROP TABLE IF EXISTS `tblcommunities`;
CREATE TABLE `tblcommunities` (
  `communityID` int NOT NULL AUTO_INCREMENT,
  `communityName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `communityLocationLat` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `communityLocationLon` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`communityID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `tblcommunitymessages`
--

DROP TABLE IF EXISTS `tblcommunitymessages`;
CREATE TABLE `tblcommunitymessages` (
  `messageID` int NOT NULL AUTO_INCREMENT,
  `messageContent` varchar(4000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `messageDate` date NOT NULL,
  `messageCommunityID` int NOT NULL,
  `messageUserId` int NOT NULL,
  PRIMARY KEY (`messageID`),
  KEY `RelCommunityMessages` (`messageCommunityID`),
  KEY `RelUserMessages` (`messageUserId`),
  CONSTRAINT `RelCommunityMessages` FOREIGN KEY (`messageCommunityID`) REFERENCES `tblcommunities` (`communityID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `RelUserMessages` FOREIGN KEY (`messageUserId`) REFERENCES `tblusuarios` (`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `tblcommunityusers`
--

DROP TABLE IF EXISTS `tblcommunityusers`;
CREATE TABLE `tblcommunityusers` (
  `commUserCommunityID` int NOT NULL,
  `commUserUserId` int NOT NULL,
  `commUserAdmin` varchar(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`commUserCommunityID`,`commUserUserId`),
  KEY `RelUsersCommunities` (`commUserUserId`),
  CONSTRAINT `RelCommunityUsers` FOREIGN KEY (`commUserCommunityID`) REFERENCES `tblcommunities` (`communityID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `RelUsersCommunities` FOREIGN KEY (`commUserUserId`) REFERENCES `tblusuarios` (`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `tblusercomparations`
--

DROP TABLE IF EXISTS `tblusercomparations`;
CREATE TABLE `tblusercomparations` (
  `comparationID` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`comparationID`),
  KEY `RelUserComparations` (`userId`),
  CONSTRAINT `RelUserComparations` FOREIGN KEY (`userId`) REFERENCES `tblusuarios` (`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `tbluserfavoritevehicles`
--

DROP TABLE IF EXISTS `tbluserfavoritevehicles`;
CREATE TABLE `tbluserfavoritevehicles` (
  `favoriteID` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`favoriteID`),
  KEY `RelUserFavorites` (`userId`),
  CONSTRAINT `RelUserFavorites` FOREIGN KEY (`userId`) REFERENCES `tblusuarios` (`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `tbluserpreferences`
--

DROP TABLE IF EXISTS `tbluserpreferences`;
CREATE TABLE `tbluserpreferences` (
  `preferenceID` int NOT NULL AUTO_INCREMENT,
  `preferenceBrandID` int NOT NULL,
  `preferenceCategoryID` int NOT NULL,
  `preferencePriceMax` int NOT NULL,
  `preferenceUserId` int NOT NULL,
  PRIMARY KEY (`preferenceID`),
  KEY `RelUserPrefBrand` (`preferenceBrandID`),
  KEY `RelUserPrefCategory` (`preferenceCategoryID`),
  KEY `RelUserPreferences` (`preferenceUserId`),
  CONSTRAINT `RelUserPrefBrand` FOREIGN KEY (`preferenceBrandID`) REFERENCES `tblvehiclebrand` (`brandID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `RelUserPrefCategory` FOREIGN KEY (`preferenceCategoryID`) REFERENCES `tblvehiclecategories` (`categoryID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `RelUserPreferences` FOREIGN KEY (`preferenceUserId`) REFERENCES `tblusuarios` (`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `tblusersfeedback`
--

DROP TABLE IF EXISTS `tblusersfeedback`;
CREATE TABLE `tblusersfeedback` (
  `feedbackID` int NOT NULL,
  `feedbackContent` varchar(4000) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`feedbackID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `tblusuarios`
--

DROP TABLE IF EXISTS `tblusuarios`;
CREATE TABLE `tblusuarios` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `userFirebaseUID` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userEmail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userPhotoURL` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAppVersion` varchar(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mfaBackupCodes` text COLLATE utf8mb4_unicode_ci,
  `mfaEnabled` tinyint(1) NOT NULL DEFAULT '0',
  `mfaSecret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `userFirebaseUID` (`userFirebaseUID`),
  UNIQUE KEY `userEmail` (`userEmail`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tblusuarios`
--

LOCK TABLES `tblusuarios` WRITE;
INSERT INTO `tblusuarios` (`userId`,`userFirebaseUID`,`userEmail`,`userName`,`userPhotoURL`,`userAppVersion`,`mfaBackupCodes`,`mfaEnabled`,`mfaSecret`) VALUES (2,'local_andreycubillo69@gmail.com','andreycubillo69@gmail.com','Roilan Cubillo','https://res.cloudinary.com/dbt0pzkfq/image/upload/v1767991464/users/profiles/f8q5cxza48ozgx1pn7s6.jpg','1',NULL,0,'$2b$10$TtQkFTni1V8P61zLW.aB3OyYeh8a6ttt.vrSp866IAaZWRejVbnIC');
UNLOCK TABLES;

--
-- Table structure for table `tblvehiclebrand`
--

DROP TABLE IF EXISTS `tblvehiclebrand`;
CREATE TABLE `tblvehiclebrand` (
  `brandID` int NOT NULL AUTO_INCREMENT,
  `brandBrand` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`brandID`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tblvehiclebrand`
--

LOCK TABLES `tblvehiclebrand` WRITE;
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (1,'Toyota');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (2,'Nissan');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (3,'Yamaha');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (4,'Yamaha');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (5,'Kawasaki');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (6,'Suzuki');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (7,'KTM');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (8,'Ducati');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (9,'Triumph');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (10,'Harley-Davidson');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (11,'BMW Motorrad');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (12,'Honda Motos');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (13,'Yamaha');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (14,'Kawasaki');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (15,'Suzuki');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (16,'KTM');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (17,'Ducati');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (18,'Triumph');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (19,'Harley-Davidson');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (20,'BMW Motorrad');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (21,'Honda Motos');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (22,'Yamaha');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (23,'Kawasaki');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (24,'Suzuki');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (25,'KTM');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (26,'Ducati');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (27,'Triumph');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (28,'Harley-Davidson');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (29,'BMW Motorrad');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (30,'Honda Motos');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (31,'Yamaha');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (32,'Kawasaki');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (33,'Suzuki');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (34,'KTM');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (35,'Ducati');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (36,'Triumph');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (37,'Harley-Davidson');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (38,'BMW Motorrad');
INSERT INTO `tblvehiclebrand` (`brandID`,`brandBrand`) VALUES (39,'Honda Motos');
UNLOCK TABLES;

--
-- Table structure for table `tblvehiclecategories`
--

DROP TABLE IF EXISTS `tblvehiclecategories`;
CREATE TABLE `tblvehiclecategories` (
  `categoryID` int NOT NULL AUTO_INCREMENT,
  `categoryDescription` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`categoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tblvehiclecategories`
--

LOCK TABLES `tblvehiclecategories` WRITE;
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (1,'Sedán');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (2,'Suv');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (3,'Moto Deportiva');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (4,'Moto Naked');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (5,'Moto Touring');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (6,'Moto Cruiser');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (7,'Moto Adventure');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (8,'Scooter');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (9,'Moto Urbana');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (10,'Moto Off-Road');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (11,'Moto Deportiva');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (12,'Moto Naked');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (13,'Moto Touring');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (14,'Moto Cruiser');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (15,'Moto Adventure');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (16,'Scooter');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (17,'Moto Urbana');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (18,'Moto Off-Road');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (19,'Moto Deportiva');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (20,'Moto Naked');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (21,'Moto Touring');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (22,'Moto Cruiser');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (23,'Moto Adventure');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (24,'Scooter');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (25,'Moto Urbana');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (26,'Moto Off-Road');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (27,'Moto Deportiva');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (28,'Moto Naked');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (29,'Moto Touring');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (30,'Moto Cruiser');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (31,'Moto Adventure');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (32,'Scooter');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (33,'Moto Urbana');
INSERT INTO `tblvehiclecategories` (`categoryID`,`categoryDescription`) VALUES (34,'Moto Off-Road');
UNLOCK TABLES;

--
-- Table structure for table `tblvehiclemodel`
--

DROP TABLE IF EXISTS `tblvehiclemodel`;
CREATE TABLE `tblvehiclemodel` (
  `modelID` int NOT NULL AUTO_INCREMENT,
  `modelDescription` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`modelID`),
  UNIQUE KEY `modelDescription` (`modelDescription`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tblvehiclemodel`
--

LOCK TABLES `tblvehiclemodel` WRITE;
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (23,'Bonneville');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (26,'CB500X');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (1,'Corolla');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (27,'CRF250L');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (13,'Duke 250');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (12,'Duke 390');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (15,'GSX-R750');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (19,'Iron 883');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (5,'Kicks');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (21,'Monster 821');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (6,'MT-07');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (7,'MT-09');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (9,'Ninja 400');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (8,'Ninja 650');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (20,'Panigale V2');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (4,'Pathfinder ');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (11,'PCX 125');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (10,'PCX 160');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (24,'R1250GS');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (2,'Rav4');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (25,'S1000RR');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (3,'Sentra');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (18,'Street 750');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (22,'Street Triple');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (14,'V-Strom 650');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (16,'XTZ 125');
INSERT INTO `tblvehiclemodel` (`modelID`,`modelDescription`) VALUES (17,'XTZ 250');
UNLOCK TABLES;

--
-- Table structure for table `tblvehicles`
--

DROP TABLE IF EXISTS `tblvehicles`;
CREATE TABLE `tblvehicles` (
  `vehicleID` int NOT NULL AUTO_INCREMENT,
  `vehicleBrandID` int NOT NULL,
  `vehicleModelID` int NOT NULL,
  `vehicleVersionID` int NOT NULL,
  `vehicleCategoryID` int NOT NULL,
  `vehicleYear` int NOT NULL,
  `vehiclePDF` blob,
  `vehiclePrice` int NOT NULL,
  `comparationID` int DEFAULT NULL,
  `favoriteID` int DEFAULT NULL,
  `vehicleImageURL` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehiclePDFURL` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehiclePowerHP` int DEFAULT NULL,
  `vehicleDisplacementCC` int DEFAULT NULL,
  `vehicleMaxSpeedKMH` int DEFAULT NULL,
  `vehicleFuelConsumption` decimal(4,2) DEFAULT NULL,
  `vehicleFuelType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicleWeightKG` int DEFAULT NULL,
  `vehiclePassengers` int DEFAULT NULL,
  `vehicleGroundClearance` int DEFAULT NULL,
  `vehicleFuelTankCapacity` int DEFAULT NULL,
  `vehicleSafetyRating` int DEFAULT NULL,
  `vehicleDriveType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicleTransmission` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicleSuspension` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicleSpecsExtracted` tinyint(1) NOT NULL DEFAULT '0',
  `vehicleSpecsUpdatedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`vehicleID`),
  KEY `RelComparationVehicles` (`comparationID`),
  KEY `RelFavoriteVehicles` (`favoriteID`),
  KEY `RelVehicleCategory` (`vehicleCategoryID`),
  KEY `RelVehiclesBrands` (`vehicleBrandID`),
  KEY `RelVehiclesModels` (`vehicleModelID`),
  KEY `RelVehiclesVersions` (`vehicleVersionID`),
  KEY `tblvehicles_vehiclePrice_idx` (`vehiclePrice`),
  KEY `tblvehicles_vehiclePowerHP_idx` (`vehiclePowerHP`),
  KEY `tblvehicles_vehicleFuelConsumption_idx` (`vehicleFuelConsumption`),
  KEY `tblvehicles_vehicleSafetyRating_idx` (`vehicleSafetyRating`),
  KEY `tblvehicles_vehiclePassengers_idx` (`vehiclePassengers`),
  CONSTRAINT `RelComparationVehicles` FOREIGN KEY (`comparationID`) REFERENCES `tblusercomparations` (`comparationID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `RelFavoriteVehicles` FOREIGN KEY (`favoriteID`) REFERENCES `tbluserfavoritevehicles` (`favoriteID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `RelVehicleCategory` FOREIGN KEY (`vehicleCategoryID`) REFERENCES `tblvehiclecategories` (`categoryID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `RelVehiclesBrands` FOREIGN KEY (`vehicleBrandID`) REFERENCES `tblvehiclebrand` (`brandID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `RelVehiclesModels` FOREIGN KEY (`vehicleModelID`) REFERENCES `tblvehiclemodel` (`modelID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `RelVehiclesVersions` FOREIGN KEY (`vehicleVersionID`) REFERENCES `tblvehicleversion` (`versionID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tblvehicles`
--

LOCK TABLES `tblvehicles` WRITE;
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (8,2,3,1,1,2025,NULL,31000,NULL,NULL,'https://res.cloudinary.com/dbt0pzkfq/image/upload/v1767719642/vehicles/images/vykozv1pta1f8ghkyfff.jpg','https://res.cloudinary.com/dbt0pzkfq/raw/upload/v1767719645/vehicles/pdfs/1767719641692_umno5jon1db.pdf',145,1997,180,'7.50','Gasolina',1815,5,145,47,5,'FWD','CVT','Delantera',1,'2026-01-08 23:27:32');
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (9,1,2,1,2,2025,NULL,45000,NULL,NULL,'https://res.cloudinary.com/dbt0pzkfq/image/upload/v1767719780/vehicles/images/sfornonk8g6sr2tmqwmm.png','https://res.cloudinary.com/dbt0pzkfq/raw/upload/v1767719781/vehicles/pdfs/1767719779224_hgh5m8rfq48.pdf',198,2487,190,'8.50','Gasolina',2030,5,195,55,5,'AWD','CVT','Ambas',1,'2026-01-09 02:05:46');
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (10,1,1,1,1,2025,NULL,30000,NULL,NULL,'https://res.cloudinary.com/dbt0pzkfq/image/upload/v1767719889/vehicles/images/qwe5s5iyblqpxbikxuo2.avif','https://res.cloudinary.com/dbt0pzkfq/raw/upload/v1767719891/vehicles/pdfs/1767719888636_avj3oygvh0d.pdf',138,1987,180,'6.10','Gasolina',1845,5,140,50,5,'FWD','CVT','Ambas',1,'2026-01-08 03:00:43');
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (11,2,4,1,2,2025,NULL,37000,NULL,NULL,'https://res.cloudinary.com/dbt0pzkfq/image/upload/v1767724277/vehicles/images/irzpgmihcad3pmnkzq6i.jpg','https://res.cloudinary.com/dbt0pzkfq/raw/upload/v1767724283/vehicles/pdfs/1767724276770_rsafulhqcfo.pdf',270,3498,190,'10.20','Gasolina',1970,8,180,70,5,'AWD','CVT','Ambas',1,'2026-01-09 02:05:39');
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (12,2,5,1,2,2025,NULL,22000,NULL,NULL,'https://res.cloudinary.com/dbt0pzkfq/image/upload/v1767731163/vehicles/images/uhrezyzebm39co4sgryp.jpg','https://res.cloudinary.com/dbt0pzkfq/raw/upload/v1767731167/vehicles/pdfs/1767731162045_zb53lh8sxye.pdf',142,2000,175,'7.00','Gasolina',1740,5,180,41,5,'FWD','CVT','Delantera',1,'2026-01-08 03:00:34');
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (13,3,6,3,4,2024,NULL,8500,NULL,NULL,NULL,NULL,73,689,190,'3.80','Gasolina',182,2,805,14,NULL,NULL,'6 velocidades','Naked',0,NULL);
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (14,3,7,5,4,2024,NULL,10500,NULL,NULL,NULL,NULL,115,890,220,'4.50','Gasolina',193,2,825,14,NULL,NULL,'6 velocidades','Naked',0,NULL);
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (15,5,8,5,3,2024,NULL,9200,NULL,NULL,NULL,NULL,68,649,200,'4.20','Gasolina',187,2,790,15,NULL,NULL,'6 velocidades','Deportiva',0,NULL);
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (16,5,9,3,3,2024,NULL,6500,NULL,NULL,NULL,NULL,49,399,180,'3.70','Gasolina',168,2,785,14,NULL,NULL,'6 velocidades','Deportiva',0,NULL);
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (17,12,10,2,8,2024,NULL,3500,NULL,NULL,NULL,NULL,15,156,110,'2.10','Gasolina',131,2,764,8,NULL,NULL,'Automática CVT','Scooter',0,NULL);
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (18,12,11,2,8,2024,NULL,2800,NULL,NULL,NULL,NULL,12,125,100,'1.90','Gasolina',130,2,764,8,NULL,NULL,'Automática CVT','Scooter',0,NULL);
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (19,7,12,3,4,2024,NULL,6800,NULL,NULL,NULL,NULL,44,373,167,'3.50','Gasolina',149,2,830,13,NULL,NULL,'6 velocidades','Naked',0,NULL);
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (20,7,13,2,4,2024,NULL,5200,NULL,NULL,NULL,NULL,30,248,145,'3.20','Gasolina',148,2,830,13,NULL,NULL,'6 velocidades','Naked',0,NULL);
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (21,6,14,4,7,2024,NULL,11500,NULL,NULL,NULL,NULL,70,645,180,'5.00','Gasolina',216,2,835,20,NULL,NULL,'6 velocidades','Adventure',0,NULL);
INSERT INTO `tblvehicles` (`vehicleID`,`vehicleBrandID`,`vehicleModelID`,`vehicleVersionID`,`vehicleCategoryID`,`vehicleYear`,`vehiclePDF`,`vehiclePrice`,`comparationID`,`favoriteID`,`vehicleImageURL`,`vehiclePDFURL`,`vehiclePowerHP`,`vehicleDisplacementCC`,`vehicleMaxSpeedKMH`,`vehicleFuelConsumption`,`vehicleFuelType`,`vehicleWeightKG`,`vehiclePassengers`,`vehicleGroundClearance`,`vehicleFuelTankCapacity`,`vehicleSafetyRating`,`vehicleDriveType`,`vehicleTransmission`,`vehicleSuspension`,`vehicleSpecsExtracted`,`vehicleSpecsUpdatedAt`) VALUES (22,6,15,5,3,2024,NULL,14500,NULL,NULL,NULL,NULL,148,750,260,'5.80','Gasolina',190,2,810,17,NULL,NULL,'6 velocidades','Deportiva',0,NULL);
UNLOCK TABLES;

--
-- Table structure for table `tblvehiclesopinions`
--

DROP TABLE IF EXISTS `tblvehiclesopinions`;
CREATE TABLE `tblvehiclesopinions` (
  `opinionID` int NOT NULL AUTO_INCREMENT,
  `opinionRate` int NOT NULL,
  `opinionComment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opinionDate` date NOT NULL,
  `opinionVehicleID` int NOT NULL,
  `opinionUserId` int NOT NULL,
  PRIMARY KEY (`opinionID`),
  KEY `RelUserOpinion` (`opinionUserId`),
  KEY `RelVehicleOpinions` (`opinionVehicleID`),
  CONSTRAINT `RelUserOpinion` FOREIGN KEY (`opinionUserId`) REFERENCES `tblusuarios` (`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `RelVehicleOpinions` FOREIGN KEY (`opinionVehicleID`) REFERENCES `tblvehicles` (`vehicleID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `tblvehicleversion`
--

DROP TABLE IF EXISTS `tblvehicleversion`;
CREATE TABLE `tblvehicleversion` (
  `versionID` int NOT NULL AUTO_INCREMENT,
  `versionDescription` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`versionID`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tblvehicleversion`
--

LOCK TABLES `tblvehicleversion` WRITE;
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (1,'estandar');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (2,'Standard');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (3,'ABS');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (4,'Premium');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (5,'Sport');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (6,'Touring');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (7,'Standard');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (8,'ABS');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (9,'Premium');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (10,'Sport');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (11,'Touring');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (12,'Standard');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (13,'ABS');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (14,'Premium');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (15,'Sport');
INSERT INTO `tblvehicleversion` (`versionID`,`versionDescription`) VALUES (16,'Touring');
UNLOCK TABLES;

SET FOREIGN_KEY_CHECKS=1;
