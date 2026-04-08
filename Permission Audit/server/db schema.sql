PRAGMA foreign_keys = ON;
CREATE TABLE SharePointPermissions (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaignId INTEGER,
    URL TEXT,
    SharePointObject TEXT,
    ObjectType TEXT,
    InheritsPermissions TEXT,
    Name TEXT,
    SensitivityLabel TEXT,
    RetentionLabel TEXT,
    Email TEXT,
    PrincipalType TEXT,
    IsExternalUser TEXT,
    IsDeleted TEXT,
    IsLicensed TEXT,
    SignInStatus TEXT,
    GivenThrough TEXT,
    Department TEXT,
    JobTitle TEXT,
    Permission TEXT,
    FOREIGN KEY (campaignId) REFERENCES Campaigns(Id)
);

CREATE TABLE "AuditLogs" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    principal TEXT NOT NULL,
    site TEXT NOT NULL,
    library TEXT NOT NULL,
    UPN TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    adminApproved BOOLEAN,
    adminApprovedTimestamp DATETIME,
    Permission TEXT,
    GroupName TEXT,
    Decision TEXT,
    campaignId INTEGER NOT NULL,

    UNIQUE(site, library, principal, UPN, campaignId),

    FOREIGN KEY (campaignId)
        REFERENCES Campaigns(Id)
        ON DELETE CASCADE
);

CREATE TABLE Campaigns (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    InitiatedAt DATETIME NOT NULL,
    DueAt DATETIME,
    CompletedAt DATETIME,
    Status TEXT
);

CREATE TABLE SuperOwners (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaignId INTEGER,
    URL TEXT,
    Name TEXT,
    Email TEXT, 
    Secret VARCHAR(64),
    FOREIGN KEY (campaignId) REFERENCES Campaigns(Id) ON DELETE CASCADE
);



-- Current SuperOwners
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (217, 'https://sustainabletimbertasmania.sharepoint.com/teams/teambudgetreview', 'Adrian Pereira', 'Adrian.Pereira@sttas.com.au', '3dfab68b031295d4f001eebccbd2200c3959f0399f5c6bd74f6bf27735f56022');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (218, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_Finance', 'Adrian Pereira', 'Adrian.Pereira@sttas.com.au', '3dfab68b031295d4f001eebccbd2200c3959f0399f5c6bd74f6bf27735f56022');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (219, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_Sales', 'Adrian Pereira', 'Adrian.Pereira@sttas.com.au', '3dfab68b031295d4f001eebccbd2200c3959f0399f5c6bd74f6bf27735f56022');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (220, 'https://sustainabletimbertasmania.sharepoint.com/teams/teambusinesscases', 'Adrian Pereira', 'Adrian.Pereira@sttas.com.au', '3dfab68b031295d4f001eebccbd2200c3959f0399f5c6bd74f6bf27735f56022');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (221, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamfinancesystemproject', 'Adrian Pereira', 'Adrian.Pereira@sttas.com.au', '3dfab68b031295d4f001eebccbd2200c3959f0399f5c6bd74f6bf27735f56022');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (222, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamplantationworkinggroup', 'Adrian Walls', 'Adrian.Walls@sttas.com.au', '9ebd281c4d8ed9d00d358f243031e42a0b87cb4a5d9c0cbfa077287051057c77');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (223, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_FleetandFacilities', 'Andrew Cuthbertson', 'Andrew.Cuthbertson@sttas.com.au', '0e12766489308bb547e601b4a905fa9cd13b750b0687c3f78cb9f6433c79cf94');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (224, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamseniorfmtnorth', 'Brodie Frost', 'brodie.frost@sttas.com.au', 'c8dfdb393eee1e44d2e2846b80bddd89d8767ba60a4598c578556163f13b3fac');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (225, 'https://sustainabletimbertasmania.sharepoint.com/teams/communicationsandengagement', 'Carmen Windsor', 'Carmen.Windsor@sttas.com.au', '0a4cf6a36e97fe28708106d2dc08bffaae1405daccb4872adfebf00af3092efd');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (226, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamcorporateservices', 'Casey Bell', 'Casey.Bell@sttas.com.au', '116710d7e260bbc86d940037232517660c310df27218d2f3ca160571c282f5c7');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (227, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamfieldops', 'Casey Bell', 'Casey.Bell@sttas.com.au', '116710d7e260bbc86d940037232517660c310df27218d2f3ca160571c282f5c7');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (228, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamissc', 'Casey Bell', 'Casey.Bell@sttas.com.au', '116710d7e260bbc86d940037232517660c310df27218d2f3ca160571c282f5c7');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (229, 'https://sustainabletimbertasmania.sharepoint.com/teams/BusinessSystemsSystemsAccounts', 'CEO', 'dean.kearney@sttas.com.au', 'd503b49cad2d52c4d1ebd2b716cc96d419e0a6aab8c0af3b6ddedbc845841b92');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (230, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_GIS', 'Chen Zhang', 'Chen.Zhang@sttas.com.au', 'fab4715bfbb0c99c8a3078a9309c022e1282fba7794c2c1b4df37c5995b6aea8');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (231, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamgis', 'Chen Zhang', 'Chen.Zhang@sttas.com.au', 'fab4715bfbb0c99c8a3078a9309c022e1282fba7794c2c1b4df37c5995b6aea8');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (232, 'https://sustainabletimbertasmania.sharepoint.com/teams/boardpapertraining', 'Chris Brookwell (GM)', 'Chris.Brookwell@sttas.com.au', '9203220d9840d571ccacc9473f9b2535b579fa1c7e070856f8f9aa5d2b8de856');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (233, 'https://sustainabletimbertasmania.sharepoint.com/sites/ChangeHub', 'Chris Brookwell (GM)', 'Chris.Brookwell@sttas.com.au', '9203220d9840d571ccacc9473f9b2535b579fa1c7e070856f8f9aa5d2b8de856');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (234, 'https://sustainabletimbertasmania.sharepoint.com/teams/EnterprisePlan', 'Chris Brookwell (GM)', 'Chris.Brookwell@sttas.com.au', '9203220d9840d571ccacc9473f9b2535b579fa1c7e070856f8f9aa5d2b8de856');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (235, 'https://sustainabletimbertasmania.sharepoint.com/teams/TeamStrategyDelivery', 'Chris Brookwell (GM)', 'Chris.Brookwell@sttas.com.au', '9203220d9840d571ccacc9473f9b2535b579fa1c7e070856f8f9aa5d2b8de856');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (236, 'https://sustainabletimbertasmania.sharepoint.com/teams/STT-Deloitte', 'Chris Brookwell (GM)', 'Chris.Brookwell@sttas.com.au', '9203220d9840d571ccacc9473f9b2535b579fa1c7e070856f8f9aa5d2b8de856');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (237, 'https://sustainabletimbertasmania.sharepoint.com/teams/TeamFPPReviewProject', 'Chris Brookwell (GM)', 'Chris.Brookwell@sttas.com.au', '9203220d9840d571ccacc9473f9b2535b579fa1c7e070856f8f9aa5d2b8de856');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (238, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamplantationperformancemeasures', 'Chris Brookwell (GM)', 'Chris.Brookwell@sttas.com.au', '9203220d9840d571ccacc9473f9b2535b579fa1c7e070856f8f9aa5d2b8de856');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (239, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamneplanning', 'Daniel Comins', 'Daniel.Comins@sttas.com.au', '236690509aaab77de70520e2186f61608e58736f124f65b48159f0dcd28b82bb');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (240, 'https://sustainabletimbertasmania.sharepoint.com/sites/Library', 'Daniel Hodge', 'Daniel.Hodge@sttas.com.au', '02e46a3ead7e736bc4c257830e810a1c5215ca7f698d6531f3218abd75542c01');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (241, 'https://sustainabletimbertasmania.sharepoint.com/teams/BusinessContinuity', 'David Bartlett', 'David.Bartlett@sttas.com.au', '69636212f8a9ed042a28255f74f9972cac42c7db074834b3ae0a037b2ee51505');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (242, 'https://sustainabletimbertasmania.sharepoint.com/teams/newood', 'David Bartlett', 'David.Bartlett@sttas.com.au', '69636212f8a9ed042a28255f74f9972cac42c7db074834b3ae0a037b2ee51505');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (243, 'https://sustainabletimbertasmania.sharepoint.com/teams/ProjectRedwater', 'David Bartlett', 'David.Bartlett@sttas.com.au', '69636212f8a9ed042a28255f74f9972cac42c7db074834b3ae0a037b2ee51505');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (244, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamcontractsandprocurement', 'David Bartlett', 'David.Bartlett@sttas.com.au', '69636212f8a9ed042a28255f74f9972cac42c7db074834b3ae0a037b2ee51505');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (245, 'https://sustainabletimbertasmania.sharepoint.com/teams/STH', 'David White', 'David.White@sttas.com.au', '7f495781f4e912f4fc66b8590d3dcce7bb01035e844609758fdc79f7f3a39194');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (246, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_FireMgt', 'Dean Sheehan', 'Dean.Sheehan@sttas.com.au', '1faa8b769a8ebfbc9b12cc7331acfd2b353ad93733296d88092f773a19ca97c2');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (247, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamirms', 'Dean Sheehan', 'Dean.Sheehan@sttas.com.au', '1faa8b769a8ebfbc9b12cc7331acfd2b353ad93733296d88092f773a19ca97c2');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (248, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_CyberManagement', 'Geoff Hudson', 'geoff.hudson@sttas.com.au', 'b2f0e4275cc18e7ee211d3ad12eabad538014fa46d4cb9888bccedb262fdca42');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (249, 'https://sustainabletimbertasmania.sharepoint.com/teams/EDMSProjectTeam', 'Geoff Hudson', 'geoff.hudson@sttas.com.au', 'b2f0e4275cc18e7ee211d3ad12eabad538014fa46d4cb9888bccedb262fdca42');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (250, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamincidentresponse', 'Geoff Hudson', 'geoff.hudson@sttas.com.au', 'b2f0e4275cc18e7ee211d3ad12eabad538014fa46d4cb9888bccedb262fdca42');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (251, 'https://sustainabletimbertasmania.sharepoint.com/teams/knowledgebase', 'Geoff Hudson', 'geoff.hudson@sttas.com.au', 'b2f0e4275cc18e7ee211d3ad12eabad538014fa46d4cb9888bccedb262fdca42');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (252, 'https://sustainabletimbertasmania.sharepoint.com/teams/PMF', 'Geoff Hudson', 'geoff.hudson@sttas.com.au', 'b2f0e4275cc18e7ee211d3ad12eabad538014fa46d4cb9888bccedb262fdca42');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (253, 'https://sustainabletimbertasmania.sharepoint.com/teams/sttshare', 'Geoff Hudson', 'geoff.hudson@sttas.com.au', 'b2f0e4275cc18e7ee211d3ad12eabad538014fa46d4cb9888bccedb262fdca42');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (254, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamcybermanagementproject', 'Geoff Hudson', 'geoff.hudson@sttas.com.au', 'b2f0e4275cc18e7ee211d3ad12eabad538014fa46d4cb9888bccedb262fdca42');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (255, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamedmsproject', 'Geoff Hudson', 'geoff.hudson@sttas.com.au', 'b2f0e4275cc18e7ee211d3ad12eabad538014fa46d4cb9888bccedb262fdca42');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (256, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_Infrastructure', 'Hitoshi Horie', 'hitoshi.horie@sttas.com.au', '19dd5458a05eb42b38b460704b3084761bfeff40841eafcd0df73d435fdd86b5');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (257, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_Payroll', 'Joanne Pangrazzi', 'Joanne.Pangrazzi@sttas.com.au', '7961f53457c4559a370be3c5ad8258f40ce706462eee137bcb4f33ed36c81599');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (258, 'https://sustainabletimbertasmania.sharepoint.com/teams/KeyAndLock', 'John McNamara', 'John.McNamara@sttas.com.au', 'b1ea77418faddbfa6c1fccc1f4813760e9388a359ab913f22366e1930c7d6714');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (259, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamnesttdutyofficer', 'John McNamara', 'John.McNamara@sttas.com.au', 'b1ea77418faddbfa6c1fccc1f4813760e9388a359ab913f22366e1930c7d6714');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (260, 'https://sustainabletimbertasmania.sharepoint.com/sites/actioncentre', 'Kes Haywood', 'kes.haywood@sttas.com.au', '7371c7fc301e30800676ae0729724ab4a976e8f413090dd0aa7c6f842d24a85b');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (261, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_BusinessSystems', 'Kes Haywood', 'kes.haywood@sttas.com.au', '7371c7fc301e30800676ae0729724ab4a976e8f413090dd0aa7c6f842d24a85b');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (262, 'https://sustainabletimbertasmania.sharepoint.com/teams/fleetandfacilitiessystems', 'Kes Haywood', 'kes.haywood@sttas.com.au', '7371c7fc301e30800676ae0729724ab4a976e8f413090dd0aa7c6f842d24a85b');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (263, 'https://sustainabletimbertasmania.sharepoint.com/teams/ForestProductsSystems', 'Kes Haywood', 'kes.haywood@sttas.com.au', '7371c7fc301e30800676ae0729724ab4a976e8f413090dd0aa7c6f842d24a85b');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (264, 'https://sustainabletimbertasmania.sharepoint.com/teams/teaminhousesystemsproject', 'Kes Haywood', 'kes.haywood@sttas.com.au', '7371c7fc301e30800676ae0729724ab4a976e8f413090dd0aa7c6f842d24a85b');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (265, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamboard', 'Kirby Barrenger', 'Kirby.Barrenger@sttas.com.au', '8845448abc9b7a7edb84d9f9a66c005068b4d0101d8c948401787456992e3e94');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (266, 'https://sustainabletimbertasmania.sharepoint.com/teams/CSEC', 'Kirby Barrenger', 'Kirby.Barrenger@sttas.com.au', '8845448abc9b7a7edb84d9f9a66c005068b4d0101d8c948401787456992e3e94');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (267, 'https://sustainabletimbertasmania.sharepoint.com/sites/Governance', 'Kirby Barrenger', 'Kirby.Barrenger@sttas.com.au', '8845448abc9b7a7edb84d9f9a66c005068b4d0101d8c948401787456992e3e94');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (268, 'https://sustainabletimbertasmania.sharepoint.com/teams/co-sec', 'Kirby Barrenger', 'Kirby.Barrenger@sttas.com.au', '8845448abc9b7a7edb84d9f9a66c005068b4d0101d8c948401787456992e3e94');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (269, 'https://sustainabletimbertasmania.sharepoint.com/teams/IT_Test_Playground', 'Kris Holmes', 'Kris.Holmes@sttas.com.au', '6f0798ec95c1c7fd9370ee92c592d0004761b41691f266d5e879ac2da1719186');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (270, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_ForestMgt', 'Lachie Clark', 'Lachie.Clark@sttas.com.au', '308ca108afdcd44618a485dfaad57cb8517300c2313361ca89cb67bef37b319e');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (271, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_Certification', 'Lachie Clark', 'Lachie.Clark@sttas.com.au', '308ca108afdcd44618a485dfaad57cb8517300c2313361ca89cb67bef37b319e');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (272, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamrbnc', 'Linda Crawford', 'Linda.Crawford@sttas.com.au', 'a891955270b78be8e10f88cf3ad222dcb9fed0f909f7f9648d17aee8d13529b2');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (273, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_PeopleandCulture', 'Linda Crawford', 'Linda.Crawford@sttas.com.au', 'a891955270b78be8e10f88cf3ad222dcb9fed0f909f7f9648d17aee8d13529b2');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (274, 'https://sustainabletimbertasmania.sharepoint.com/teams/SuccessionPathwayCommittee', 'Linda Crawford', 'Linda.Crawford@sttas.com.au', 'a891955270b78be8e10f88cf3ad222dcb9fed0f909f7f9648d17aee8d13529b2');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (275, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamrapcommittee', 'Linda Crawford', 'Linda.Crawford@sttas.com.au', 'a891955270b78be8e10f88cf3ad222dcb9fed0f909f7f9648d17aee8d13529b2');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (276, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamyfeprogram', 'Linda Crawford', 'Linda.Crawford@sttas.com.au', 'a891955270b78be8e10f88cf3ad222dcb9fed0f909f7f9648d17aee8d13529b2');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (277, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_ResourcesandPlanning', 'Mark Rippon', 'Mark.Rippon@sttas.com.au', '5c2a8b466cab303b49ca8ae4951e2898d5ef970e353b2f3b1b9e70e3f8cf6088');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (278, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamcpsumembers', 'Mark Rippon', 'Mark.Rippon@sttas.com.au', '5c2a8b466cab303b49ca8ae4951e2898d5ef970e353b2f3b1b9e70e3f8cf6088');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (279, 'https://sustainabletimbertasmania.sharepoint.com/teams/NE', 'Matthew Patten', 'matthew.patten@sttas.com.au', '4dfb17e340866b7169ad59035c65f7a63a6c7b9a3fad5756980e9eac077f556b');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (280, 'https://sustainabletimbertasmania.sharepoint.com/teams/ceo', 'Mikayla Oates', 'mikayla.oates@sttas.com.au', 'fa7deeb5504a069ff41c2d60ac27c4276444b42ce8b6784bbed3f1a9bb63127d');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (281, 'https://sustainabletimbertasmania.sharepoint.com/teams/teambds', 'Mikayla Oates', 'mikayla.oates@sttas.com.au', 'fa7deeb5504a069ff41c2d60ac27c4276444b42ce8b6784bbed3f1a9bb63127d');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (282, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamdmc', 'Mikayla Oates', 'mikayla.oates@sttas.com.au', 'fa7deeb5504a069ff41c2d60ac27c4276444b42ce8b6784bbed3f1a9bb63127d');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (283, 'https://sustainabletimbertasmania.sharepoint.com/teams/TeamESGImplementation', 'Mikayla Oates', 'mikayla.oates@sttas.com.au', 'fa7deeb5504a069ff41c2d60ac27c4276444b42ce8b6784bbed3f1a9bb63127d');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (284, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_ExecutiveAssistants', 'Mikayla Oates', 'mikayla.oates@sttas.com.au', 'fa7deeb5504a069ff41c2d60ac27c4276444b42ce8b6784bbed3f1a9bb63127d');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (285, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamfarmc', 'Mikayla Oates', 'mikayla.oates@sttas.com.au', 'fa7deeb5504a069ff41c2d60ac27c4276444b42ce8b6784bbed3f1a9bb63127d');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (286, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamgmtmeetings', 'Mikayla Oates', 'mikayla.oates@sttas.com.au', 'fa7deeb5504a069ff41c2d60ac27c4276444b42ce8b6784bbed3f1a9bb63127d');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (287, 'https://sustainabletimbertasmania.sharepoint.com/teams/NativeResourceAllocationProcess', 'Mikayla Oates', 'mikayla.oates@sttas.com.au', 'fa7deeb5504a069ff41c2d60ac27c4276444b42ce8b6784bbed3f1a9bb63127d');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (288, 'https://sustainabletimbertasmania.sharepoint.com/teams/projecteclipse', 'Mikayla Oates', 'mikayla.oates@sttas.com.au', 'fa7deeb5504a069ff41c2d60ac27c4276444b42ce8b6784bbed3f1a9bb63127d');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (289, 'https://sustainabletimbertasmania.sharepoint.com/teams/NW', 'Mitch Roberts', 'Mitch.Roberts@sttas.com.au', '9e91e434b21e47b650701ac9988663b237e04d008cb9d5c472963997ea5d3ad3');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (290, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamnwsttdutyofficer', 'Mitch Roberts', 'Mitch.Roberts@sttas.com.au', '9e91e434b21e47b650701ac9988663b237e04d008cb9d5c472963997ea5d3ad3');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (291, 'https://sustainabletimbertasmania.sharepoint.com/teams/DigitalData', 'Nathan Bradbury', 'Nathan.Bradbury@sttas.com.au', '0b950366f2ebae6306343ff097e4055752a8659135cecd15b6cc4cdad2ccb6c6');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (292, 'https://sustainabletimbertasmania.sharepoint.com/teams/DisasterRecovery', 'Nathan Bradbury', 'Nathan.Bradbury@sttas.com.au', '0b950366f2ebae6306343ff097e4055752a8659135cecd15b6cc4cdad2ccb6c6');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (293, 'https://sustainabletimbertasmania.sharepoint.com/teams/fimssolution', 'Nathan Bradbury', 'Nathan.Bradbury@sttas.com.au', '0b950366f2ebae6306343ff097e4055752a8659135cecd15b6cc4cdad2ccb6c6');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (294, 'https://sustainabletimbertasmania.sharepoint.com/teams/LandManagementSystems', 'Nathan Bradbury', 'Nathan.Bradbury@sttas.com.au', '0b950366f2ebae6306343ff097e4055752a8659135cecd15b6cc4cdad2ccb6c6');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (295, 'https://sustainabletimbertasmania.sharepoint.com/teams/PaperMill', 'Nathan Bradbury', 'Nathan.Bradbury@sttas.com.au', '0b950366f2ebae6306343ff097e4055752a8659135cecd15b6cc4cdad2ccb6c6');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (296, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamcyberresponse', 'Nathan Bradbury', 'Nathan.Bradbury@sttas.com.au', '0b950366f2ebae6306343ff097e4055752a8659135cecd15b6cc4cdad2ccb6c6');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (297, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamdatastrategy', 'Nathan Bradbury', 'Nathan.Bradbury@sttas.com.au', '0b950366f2ebae6306343ff097e4055752a8659135cecd15b6cc4cdad2ccb6c6');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (298, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamEsriImplementation', 'Nathan Bradbury', 'Nathan.Bradbury@sttas.com.au', '0b950366f2ebae6306343ff097e4055752a8659135cecd15b6cc4cdad2ccb6c6');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (299, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamplantations', 'Nathan Bradbury', 'Nathan.Bradbury@sttas.com.au', '0b950366f2ebae6306343ff097e4055752a8659135cecd15b6cc4cdad2ccb6c6');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (300, 'https://sustainabletimbertasmania.sharepoint.com/teams/TeamTechWorkingGroup', 'Nathan Bradbury', 'Nathan.Bradbury@sttas.com.au', '0b950366f2ebae6306343ff097e4055752a8659135cecd15b6cc4cdad2ccb6c6');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (301, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamwellnesscommittee2', 'Nicola Minns', 'Nicola.Minns@sttas.com.au', 'a1dd69a8baea87e9e4994a4caaa65482d1fff0226ec52dea1153e7bdc8cb1102');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (302, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamdiversityandinclusioncommittee', 'Nicola Minns', 'Nicola.Minns@sttas.com.au', 'a1dd69a8baea87e9e4994a4caaa65482d1fff0226ec52dea1153e7bdc8cb1102');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (303, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamsocialclub', 'Nicole Carpenter', 'Nicole.Carpenter@sttas.com.au', '74fea8d9d4f876d7c5c4f8e5577baf63c3f6f885451cab9a0b9b75ce4f8b7270');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (304, 'https://sustainabletimbertasmania.sharepoint.com/teams/BusinessProcessHub', 'Nishtha Awasthy', 'nishtha.awasthy@sttas.com.au', '9dfad5a3c46b63c2f72f4206e5768973bfc34a5998bcc2cac8b0735199141314');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (305, 'https://sustainabletimbertasmania.sharepoint.com/teams/PerthWateringCalendar', 'Peter Moore', 'Peter.Moore@sttas.com.au', '3ae6d65ac114b8930d755501fb5b8e3867a963de4f09a2df79bf057c6fad57d6');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (306, 'https://sustainabletimbertasmania.sharepoint.com/sites/ContractManagement', 'Rachel Yao', 'Rachel.Yao@sttas.com.au', '0a0b115092c5f676223b8a5bcb124a6d970f15ae7e42d8ac5970f94781e66f9d');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (307, 'https://sustainabletimbertasmania.sharepoint.com/teams/harvestandtransport', 'Renee Cordwell', 'Renee.Cordwell@sttas.com.au', '8bf304d04c88668ad74f475fcf25820356d38b7467fce119368537216bcb6053');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (308, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamlandmanagement', 'Sarah Vautin', 'Sarah.Vautin@sttas.com.au', '8b8183092366ed82186a7d020a4319db2477c9e59148b0adc538fc00fe589d07');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (309, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_LandProperty', 'Sarah Vautin', 'Sarah.Vautin@sttas.com.au', '8b8183092366ed82186a7d020a4319db2477c9e59148b0adc538fc00fe589d07');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (310, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamnaturalcapitalaccounts', 'Shaun Suitor', 'Shaun.Suitor@sttas.com.au', '90ccb1b52760e4d64af1d2885bd69303939827605efd452623e708566a23f98e');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (311, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamfppplanning', 'Stephen Rymer', 'Stephen.Rymer@sttas.com.au', 'edab1a0f106c09597b3e54e505ee8daab252a4590d4295596dccee80f46b2399');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (312, 'https://sustainabletimbertasmania.sharepoint.com/teams/logqualitycommittee', 'Stephen Rymer', 'Stephen.Rymer@sttas.com.au', 'edab1a0f106c09597b3e54e505ee8daab252a4590d4295596dccee80f46b2399');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (313, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamperthredevelopmentproject', 'Stephen Rymer', 'Stephen.Rymer@sttas.com.au', 'edab1a0f106c09597b3e54e505ee8daab252a4590d4295596dccee80f46b2399');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (314, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamweeklyproductionmeeting', 'Stephen Rymer', 'Stephen.Rymer@sttas.com.au', 'edab1a0f106c09597b3e54e505ee8daab252a4590d4295596dccee80f46b2399');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (315, 'https://sustainabletimbertasmania.sharepoint.com/teams/ExternalAccess', 'System Geoff', 'geoff.hudson@sttas.com.au', 'b2f0e4275cc18e7ee211d3ad12eabad538014fa46d4cb9888bccedb262fdca42');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (316, 'https://sustainabletimbertasmania.sharepoint.com/sites/pwa', 'System Geoff', 'geoff.hudson@sttas.com.au', 'b2f0e4275cc18e7ee211d3ad12eabad538014fa46d4cb9888bccedb262fdca42');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (317, 'https://sustainabletimbertasmania.sharepoint.com/sites/Development', 'System Kes Haywood', 'kes.haywood@sttas.com.au', '7371c7fc301e30800676ae0729724ab4a976e8f413090dd0aa7c6f842d24a85b');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (318, 'https://sustainabletimbertasmania.sharepoint.com', 'System Kes Haywood', 'kes.haywood@sttas.com.au', '7371c7fc301e30800676ae0729724ab4a976e8f413090dd0aa7c6f842d24a85b');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (319, 'https://sustainabletimbertasmania.sharepoint.com/sites/MetadataGenerator', 'System Sarang', 'sarang.gadhiya@sttas.com.au', 'b2f72dc449982527af4d193ea8e57ff09fc32c3209be13eacb787f348911415c');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (320, 'https://sustainabletimbertasmania.sharepoint.com/teams/SharePointGovernanceHub', 'System Sarang', 'sarang.gadhiya@sttas.com.au', 'b2f72dc449982527af4d193ea8e57ff09fc32c3209be13eacb787f348911415c');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (321, 'https://sustainabletimbertasmania.sharepoint.com/teams/Templates', 'System Sarang', 'sarang.gadhiya@sttas.com.au', 'b2f72dc449982527af4d193ea8e57ff09fc32c3209be13eacb787f348911415c');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (322, 'https://sustainabletimbertasmania.sharepoint.com/teams/teamprotestorinformation', 'Theresa Weller', 'Theresa.Weller@sttas.com.au', '9f7adafd2c8b481fdd2fdc52fa2f5967ef44ab9ce237a72dee6360689095ff7b');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (323, 'https://sustainabletimbertasmania.sharepoint.com/teams/SECommittee', 'Theresa Weller', 'Theresa.Weller@sttas.com.au', '9f7adafd2c8b481fdd2fdc52fa2f5967ef44ab9ce237a72dee6360689095ff7b');
INSERT INTO "SuperOwners" ("Id", "URL", "Name", "Email", "Secret") VALUES (324, 'https://sustainabletimbertasmania.sharepoint.com/teams/GRP_WorkHealthSafety', 'Theresa Weller', 'Theresa.Weller@sttas.com.au', '9f7adafd2c8b481fdd2fdc52fa2f5967ef44ab9ce237a72dee6360689095ff7b');
