# Root folder
$root = "forestry-conservation-platform"

# Ensure root exists
New-Item -ItemType Directory -Path $root -Force | Out-Null

# Full file list with relative paths
$files = @(
# programs/forestry
"programs/forestry/20260110FR001ForestManagementPlanV1.docx",
"programs/forestry/20260112FR002HarvestScheduleV1.xlsx",
"programs/forestry/20260115FR003TimberInventoryReportV2.pdf",
"programs/forestry/20260118FR004ReforestationStrategyV1.pptx",

# programs/wildlife
"programs/wildlife/20260111WL001SpeciesAssessmentReportV1.docx",
"programs/wildlife/20260113WL002HabitatSurveyDataV1.xlsx",
"programs/wildlife/20260116WL003WildlifeProtectionPlanV2.pdf",
"programs/wildlife/20260119WL004ConservationBriefingV1.pptx",

# programs/parks
"programs/parks/20260109PK001ParkManagementPlanV1.docx",
"programs/parks/20260114PK002VisitorStatisticsV1.xlsx",
"programs/parks/20260117PK003InfrastructureAssessmentV1.pdf",
"programs/parks/20260120PK004CommunityEngagementDeckV1.pptx",

# programs/fire-management
"programs/fire-management/20260108FM001FireResponsePlanV1.docx",
"programs/fire-management/20260113FM002IncidentLogSummaryV1.xlsx",
"programs/fire-management/20260118FM003RiskAssessmentReportV2.pdf",
"programs/fire-management/20260121FM004SeasonPreparednessBriefV1.pptx",

# programs/land-restoration
"programs/land-restoration/20260107LR001RestorationStrategyV1.docx",
"programs/land-restoration/20260112LR002SoilRehabilitationDataV1.xlsx",
"programs/land-restoration/20260116LR003ProjectImpactReportV1.pdf",
"programs/land-restoration/20260122LR004StakeholderUpdateV1.pptx",

# programs/biodiversity
"programs/biodiversity/20260106BD001BiodiversityActionPlanV1.docx",
"programs/biodiversity/20260111BD002SpeciesIndexDataV1.xlsx",
"programs/biodiversity/20260117BD003EcosystemHealthReportV2.pdf",
"programs/biodiversity/20260123BD004ResearchOverviewV1.pptx",

# shared-services/gis
"shared-services/gis/20260105GS001SpatialDataStandardsV1.docx",
"shared-services/gis/20260110GS002GISAssetRegisterV1.xlsx",
"shared-services/gis/20260115GS003MappingComplianceReportV1.pdf",
"shared-services/gis/20260120GS004GeospatialCapabilityDeckV1.pptx",

# shared-services/permits-licensing
"shared-services/permits-licensing/20260109PL001PermitProcessingGuideV1.docx",
"shared-services/permits-licensing/20260114PL002LicenseRegisterV1.xlsx",
"shared-services/permits-licensing/20260118PL003RegulatoryComplianceReportV1.pdf",
"shared-services/permits-licensing/20260122PL004PermitWorkflowOverviewV1.pptx",

# shared-services/grants-funding
"shared-services/grants-funding/20260108GF001FundingFrameworkV1.docx",
"shared-services/grants-funding/20260113GF002GrantAllocationTrackerV1.xlsx",
"shared-services/grants-funding/20260117GF003ExpenditureReportV1.pdf",
"shared-services/grants-funding/20260121GF004BudgetBriefingDeckV1.pptx",

# shared-services/public-portal
"shared-services/public-portal/20260107PP001PortalContentStrategyV1.docx",
"shared-services/public-portal/20260112PP002UsageAnalyticsV1.xlsx",
"shared-services/public-portal/20260116PP003AccessibilityComplianceReportV1.pdf",
"shared-services/public-portal/20260123PP004DigitalServicesOverviewV1.pptx",

# shared-services/reporting-analytics
"shared-services/reporting-analytics/20260106RA001ReportingFrameworkV1.docx",
"shared-services/reporting-analytics/20260111RA002PerformanceMetricsDashboardV1.xlsx",
"shared-services/reporting-analytics/20260118RA003QuarterlyAnalyticsReportV1.pdf",
"shared-services/reporting-analytics/20260124RA004DataInsightsBriefV1.pptx",

# data/spatial
"data/spatial/20260105DS001SpatialDataCatalogV1.xlsx",
"data/spatial/20260110DS002SatelliteImageryReportV1.pdf",
"data/spatial/20260115DS003CoordinateReferenceGuideV1.docx",
"data/spatial/20260120DS004SpatialAnalysisOverviewV1.pptx",

# data/environmental
"data/environmental/20260106DE001EnvironmentalMonitoringPlanV1.docx",
"data/environmental/20260111DE002WaterQualityMeasurementsV1.xlsx",
"data/environmental/20260116DE003EnvironmentalImpactReportV1.pdf",
"data/environmental/20260122DE004ClimateTrendBriefV1.pptx",

# data/field-surveys
"data/field-surveys/20260107DF001FieldSurveyProtocolV1.docx",
"data/field-surveys/20260112DF002SurveyResultsDatasetV1.xlsx",
"data/field-surveys/20260117DF003FieldOperationsReportV1.pdf",
"data/field-surveys/20260123DF004SurveyMethodologyDeckV1.pptx",

# data/open-data
"data/open-data/20260108OD001OpenDataPolicyV1.docx",
"data/open-data/20260113OD002PublicDatasetIndexV1.xlsx",
"data/open-data/20260118OD003TransparencyReportV1.pdf",
"data/open-data/20260124OD004OpenDataStrategyDeckV1.pptx",

# policy
"policy/20260105PO001ForestryPolicyFrameworkV1.docx",
"policy/20260112PO002PolicyReviewRegisterV1.xlsx",
"policy/20260117PO003LegislativeComplianceReportV1.pdf",
"policy/20260121PO004PolicyRoadmapPresentationV1.pptx",

# compliance
"compliance/20260106CO001AuditCompliancePlanV1.docx",
"compliance/20260113CO002ComplianceChecklistV1.xlsx",
"compliance/20260118CO003InternalAuditReportV1.pdf",
"compliance/20260122CO004RegulatoryBriefingDeckV1.pptx",

# research
"research/20260107RS001ResearchProgramOverviewV1.docx",
"research/20260112RS002BiodiversityStudyDataV1.xlsx",
"research/20260117RS003ScientificFindingsReportV1.pdf",
"research/20260123RS004ResearchSymposiumDeckV1.pptx",

# security
"security/20260108SE001InformationSecurityPolicyV1.docx",
"security/20260114SE002AccessControlRegisterV1.xlsx",
"security/20260118SE003SecurityAssessmentReportV1.pdf",
"security/20260122SE004CyberSecurityAwarenessDeckV1.pptx",

# infrastructure
"infrastructure/20260109IN001InfrastructureStrategyV1.docx",
"infrastructure/20260113IN002AssetInventoryRegisterV1.xlsx",
"infrastructure/20260118IN003SystemsArchitectureReportV1.pdf",
"infrastructure/20260121IN004InfrastructureRoadmapDeckV1.pptx",

# documentation
"documentation/20260110DC001DocumentControlProcedureV1.docx",
"documentation/20260115DC002RecordsRegisterV1.xlsx",
"documentation/20260120DC003DocumentationAuditReportV1.pdf",
"documentation/20260124DC004KnowledgeManagementDeckV1.pptx",

# tests
"tests/20260111TS001SystemTestPlanV1.docx",
"tests/20260116TS002TestCaseRegisterV1.xlsx",
"tests/20260119TS003UserAcceptanceReportV1.pdf",
"tests/20260123TS004TestingSummaryPresentationV1.pptx"
)

foreach ($file in $files) {
    $fullPath = Join-Path $root $file
    $dir = Split-Path $fullPath
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    New-Item -ItemType File -Path $fullPath -Force | Out-Null
}

Write-Host "All directories and files created successfully." -ForegroundColor Green
