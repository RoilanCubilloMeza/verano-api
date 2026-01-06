-- CreateTable
CREATE TABLE `tblcommunities` (
    `communityID` INTEGER NOT NULL AUTO_INCREMENT,
    `communityName` VARCHAR(255) NOT NULL,
    `communityLocationLat` VARCHAR(20) NULL,
    `communityLocationLon` VARCHAR(20) NULL,

    PRIMARY KEY (`communityID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tblcommunitymessages` (
    `messageID` INTEGER NOT NULL AUTO_INCREMENT,
    `messageContent` VARCHAR(4000) NOT NULL,
    `messageDate` DATE NOT NULL,
    `messageCommunityID` INTEGER NOT NULL,
    `messageUserId` INTEGER NOT NULL,

    INDEX `RelCommunityMessages`(`messageCommunityID`),
    INDEX `RelUserMessages`(`messageUserId`),
    PRIMARY KEY (`messageID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tblcommunityusers` (
    `commUserCommunityID` INTEGER NOT NULL,
    `commUserUserId` INTEGER NOT NULL,
    `commUserAdmin` VARCHAR(1) NOT NULL,

    INDEX `RelUsersCommunities`(`commUserUserId`),
    PRIMARY KEY (`commUserCommunityID`, `commUserUserId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tblusercomparations` (
    `comparationID` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,

    INDEX `RelUserComparations`(`userId`),
    PRIMARY KEY (`comparationID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbluserfavoritevehicles` (
    `favoriteID` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,

    INDEX `RelUserFavorites`(`userId`),
    PRIMARY KEY (`favoriteID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbluserpreferences` (
    `preferenceID` INTEGER NOT NULL AUTO_INCREMENT,
    `preferenceBrandID` INTEGER NOT NULL,
    `preferenceCategoryID` INTEGER NOT NULL,
    `preferencePriceMax` INTEGER NOT NULL,
    `preferenceUserId` INTEGER NOT NULL,

    INDEX `RelUserPrefBrand`(`preferenceBrandID`),
    INDEX `RelUserPrefCategory`(`preferenceCategoryID`),
    INDEX `RelUserPreferences`(`preferenceUserId`),
    PRIMARY KEY (`preferenceID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tblusersfeedback` (
    `feedbackID` INTEGER NOT NULL,
    `feedbackContent` VARCHAR(4000) NOT NULL,

    PRIMARY KEY (`feedbackID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tblusuarios` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `userFirebaseUID` VARCHAR(255) NOT NULL,
    `userEmail` VARCHAR(255) NOT NULL,
    `userName` VARCHAR(255) NULL,
    `userPhotoURL` VARCHAR(500) NULL,
    `userAppVersion` VARCHAR(1) NOT NULL,
    `mfaBackupCodes` TEXT NULL,
    `mfaEnabled` BOOLEAN NOT NULL DEFAULT false,
    `mfaSecret` VARCHAR(255) NULL,

    UNIQUE INDEX `userFirebaseUID`(`userFirebaseUID`),
    UNIQUE INDEX `userEmail`(`userEmail`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tblvehiclebrand` (
    `brandID` INTEGER NOT NULL AUTO_INCREMENT,
    `brandBrand` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`brandID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tblvehiclecategories` (
    `categoryID` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryDescription` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`categoryID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tblvehiclemodel` (
    `modelID` INTEGER NOT NULL AUTO_INCREMENT,
    `modelDescription` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `modelDescription`(`modelDescription`),
    PRIMARY KEY (`modelID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tblvehicles` (
    `vehicleID` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleBrandID` INTEGER NOT NULL,
    `vehicleModelID` INTEGER NOT NULL,
    `vehicleVersionID` INTEGER NOT NULL,
    `vehicleCategoryID` INTEGER NOT NULL,
    `vehicleYear` INTEGER NOT NULL,
    `vehiclePDF` BLOB NULL,
    `vehiclePrice` INTEGER NOT NULL,
    `comparationID` INTEGER NULL,
    `favoriteID` INTEGER NULL,
    `vehicleImageURL` VARCHAR(500) NULL,
    `vehiclePDFURL` VARCHAR(500) NULL,
    `vehiclePowerHP` INTEGER NULL,
    `vehicleDisplacementCC` INTEGER NULL,
    `vehicleMaxSpeedKMH` INTEGER NULL,
    `vehicleFuelConsumption` DECIMAL(4, 2) NULL,
    `vehicleFuelType` VARCHAR(50) NULL,
    `vehicleWeightKG` INTEGER NULL,
    `vehiclePassengers` INTEGER NULL,
    `vehicleGroundClearance` INTEGER NULL,
    `vehicleFuelTankCapacity` INTEGER NULL,
    `vehicleSafetyRating` INTEGER NULL,
    `vehicleDriveType` VARCHAR(50) NULL,
    `vehicleTransmission` VARCHAR(50) NULL,
    `vehicleSuspension` VARCHAR(100) NULL,
    `vehicleSpecsExtracted` BOOLEAN NOT NULL DEFAULT false,
    `vehicleSpecsUpdatedAt` DATETIME(3) NULL,

    INDEX `RelComparationVehicles`(`comparationID`),
    INDEX `RelFavoriteVehicles`(`favoriteID`),
    INDEX `RelVehicleCategory`(`vehicleCategoryID`),
    INDEX `RelVehiclesBrands`(`vehicleBrandID`),
    INDEX `RelVehiclesModels`(`vehicleModelID`),
    INDEX `RelVehiclesVersions`(`vehicleVersionID`),
    INDEX `tblvehicles_vehiclePrice_idx`(`vehiclePrice`),
    INDEX `tblvehicles_vehiclePowerHP_idx`(`vehiclePowerHP`),
    INDEX `tblvehicles_vehicleFuelConsumption_idx`(`vehicleFuelConsumption`),
    INDEX `tblvehicles_vehicleSafetyRating_idx`(`vehicleSafetyRating`),
    INDEX `tblvehicles_vehiclePassengers_idx`(`vehiclePassengers`),
    PRIMARY KEY (`vehicleID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tblvehiclesopinions` (
    `opinionID` INTEGER NOT NULL AUTO_INCREMENT,
    `opinionRate` INTEGER NOT NULL,
    `opinionComment` VARCHAR(255) NULL,
    `opinionDate` DATE NOT NULL,
    `opinionVehicleID` INTEGER NOT NULL,
    `opinionUserId` INTEGER NOT NULL,

    INDEX `RelUserOpinion`(`opinionUserId`),
    INDEX `RelVehicleOpinions`(`opinionVehicleID`),
    PRIMARY KEY (`opinionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tblvehicleversion` (
    `versionID` INTEGER NOT NULL AUTO_INCREMENT,
    `versionDescription` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`versionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tblcommunitymessages` ADD CONSTRAINT `RelCommunityMessages` FOREIGN KEY (`messageCommunityID`) REFERENCES `tblcommunities`(`communityID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tblcommunitymessages` ADD CONSTRAINT `RelUserMessages` FOREIGN KEY (`messageUserId`) REFERENCES `tblusuarios`(`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tblcommunityusers` ADD CONSTRAINT `RelCommunityUsers` FOREIGN KEY (`commUserCommunityID`) REFERENCES `tblcommunities`(`communityID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tblcommunityusers` ADD CONSTRAINT `RelUsersCommunities` FOREIGN KEY (`commUserUserId`) REFERENCES `tblusuarios`(`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tblusercomparations` ADD CONSTRAINT `RelUserComparations` FOREIGN KEY (`userId`) REFERENCES `tblusuarios`(`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbluserfavoritevehicles` ADD CONSTRAINT `RelUserFavorites` FOREIGN KEY (`userId`) REFERENCES `tblusuarios`(`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbluserpreferences` ADD CONSTRAINT `RelUserPrefBrand` FOREIGN KEY (`preferenceBrandID`) REFERENCES `tblvehiclebrand`(`brandID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbluserpreferences` ADD CONSTRAINT `RelUserPrefCategory` FOREIGN KEY (`preferenceCategoryID`) REFERENCES `tblvehiclecategories`(`categoryID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tbluserpreferences` ADD CONSTRAINT `RelUserPreferences` FOREIGN KEY (`preferenceUserId`) REFERENCES `tblusuarios`(`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tblvehicles` ADD CONSTRAINT `RelComparationVehicles` FOREIGN KEY (`comparationID`) REFERENCES `tblusercomparations`(`comparationID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tblvehicles` ADD CONSTRAINT `RelFavoriteVehicles` FOREIGN KEY (`favoriteID`) REFERENCES `tbluserfavoritevehicles`(`favoriteID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tblvehicles` ADD CONSTRAINT `RelVehicleCategory` FOREIGN KEY (`vehicleCategoryID`) REFERENCES `tblvehiclecategories`(`categoryID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tblvehicles` ADD CONSTRAINT `RelVehiclesBrands` FOREIGN KEY (`vehicleBrandID`) REFERENCES `tblvehiclebrand`(`brandID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tblvehicles` ADD CONSTRAINT `RelVehiclesModels` FOREIGN KEY (`vehicleModelID`) REFERENCES `tblvehiclemodel`(`modelID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tblvehicles` ADD CONSTRAINT `RelVehiclesVersions` FOREIGN KEY (`vehicleVersionID`) REFERENCES `tblvehicleversion`(`versionID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tblvehiclesopinions` ADD CONSTRAINT `RelUserOpinion` FOREIGN KEY (`opinionUserId`) REFERENCES `tblusuarios`(`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tblvehiclesopinions` ADD CONSTRAINT `RelVehicleOpinions` FOREIGN KEY (`opinionVehicleID`) REFERENCES `tblvehicles`(`vehicleID`) ON DELETE RESTRICT ON UPDATE RESTRICT;
