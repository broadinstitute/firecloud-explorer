
export default {
	content() {
		return [{
			"workspaceSubmissionStats": {
				"runningSubmissionsCount": 0
			},
			"accessLevel": "READER",
			"owners": ["adm.firec@gmail.com"],
			"public": false,
			"workspace": {
				"workspaceId": "0bab6aee-312c-4610-a32b-b7fefc34a933",
				"name": "TCGA_SKCM_OpenAccess_V1-0_DATA",
				"isLocked": false,
				"lastModified": "2017-03-31T19:59:01.258Z",
				"attributes": {
					"library:requiresExternalApproval": false,
					"library:studyDesign": "Tumor/Normal",
					"library:cohortCountry": "USA",
					"library:published": true,
					"library:indication": "Skin Cutaneous Melanoma",
					"library:contactEmail": "birger@broadinstitute.org",
					"library:numSubjects": 470,
					"library:datasetOwner": "NCI",
					"library:datatype": {
						"itemsType": "AttributeValue",
						"items": ["Whole Exome", "Genotyping Array", "RNA-Seq", "miRNA-Seq", "Methylation Array", "Protein Expression Array"]
					},
					"library:primaryDiseaseSite": "Skin",
					"library:datasetCustodian": "dbGAP",
					"library:projectName": "TCGA",
					"library:cellType": "Primary tumor cell, Whole blood",
					"library:institute": {
						"itemsType": "AttributeValue",
						"items": ["NCI"]
					},
					"library:orsp": "TODO",
					"library:dataUseRestriction": "General Research Use",
					"library:datasetDepositor": "Chet Birger",
					"library:reference": "GRCh37/hg19",
					"library:datasetVersion": "V1-0_data",
					"library:datasetName": "TCGA_SKCM_OpenAccess",
					"library:dataCategory": {
						"itemsType": "AttributeValue",
						"items": ["Simple Nucleotide Variation", "Copy Number Variation", "Expression Quantification", "DNA-Methylation", "Clinical phenotypes", "Biosample metadata"]
					},
					"library:dataFileFormats": {
						"itemsType": "AttributeValue",
						"items": ["TXT", "MAF"]
					},
					"library:useLimitationOption": "skip",
					"library:datasetDescription": "This cohort is part of The Cancer Genome Atlas project (https://cancergenome.nih.gov/abouttcga/overview).  This cohort includes raw data and analysis of cancer patients samples by genomic DNA copy number arrays, DNA methylation, exome sequencing, mRNA arrays, microRNA sequencing and reverse phase protein arrays. De-identified patients’ clinical phenotypes and metadata are also included. For more information see the full TCGA cohorts publication list at: https://cancergenome.nih.gov/publications; Data description is also summarized at : https://TCGA_data.nci.nih.gov/docs/publications//tcga/datatype.html"
				},
				"createdBy": "adm.firec@gmail.com",
				"authDomainACLs": {
					"OWNER": {
						"groupName": "0bab6aee-312c-4610-a32b-b7fefc34a933-OWNER"
					},
					"PROJECT_OWNER": {
						"groupName": "PROJECT_broad-firecloud-tcga-alpha-Owner"
					},
					"READER": {
						"groupName": "0bab6aee-312c-4610-a32b-b7fefc34a933-READER"
					},
					"WRITER": {
						"groupName": "0bab6aee-312c-4610-a32b-b7fefc34a933-WRITER"
					}
				},
				"bucketName": "fc-0bab6aee-312c-4610-a32b-b7fefc34a933",
				"namespace": "broad-firecloud-tcga-alpha",
				"authorizationDomain": [],
				"createdDate": "2017-03-31T19:59:00.042Z",
				"accessLevels": {
					"OWNER": {
						"groupName": "0bab6aee-312c-4610-a32b-b7fefc34a933-OWNER"
					},
					"PROJECT_OWNER": {
						"groupName": "PROJECT_broad-firecloud-tcga-alpha-Owner"
					},
					"READER": {
						"groupName": "0bab6aee-312c-4610-a32b-b7fefc34a933-READER"
					},
					"WRITER": {
						"groupName": "0bab6aee-312c-4610-a32b-b7fefc34a933-WRITER"
					}
				}
			}
		}, {
			"workspaceSubmissionStats": {
				"runningSubmissionsCount": 0
			},
			"accessLevel": "NO ACCESS",
			"owners": ["adm.firec@gmail.com"],
			"public": false,
			"workspace": {
				"workspaceId": "60074fb5-58cc-4b50-ab69-a1920e577429",
				"name": "TCGA_SARC_ControlledAccess_V1-0_DATA",
				"isLocked": false,
				"lastModified": "2017-03-31T19:58:31.052Z",
				"attributes": {
					"library:requiresExternalApproval": true,
					"library:studyDesign": "Tumor/Normal",
					"library:cohortCountry": "USA",
					"library:published": true,
					"library:indication": "Sarcoma",
					"library:contactEmail": "birger@broadinstitute.org",
					"library:numSubjects": 261,
					"library:datasetOwner": "NCI",
					"library:datatype": {
						"itemsType": "AttributeValue",
						"items": ["Whole Exome", "Genotyping Array", "RNA-Seq", "miRNA-Seq", "Methylation Array", "Protein Expression Array"]
					},
					"library:primaryDiseaseSite": "Soft tissue",
					"library:datasetCustodian": "dbGAP",
					"library:projectName": "TCGA",
					"library:cellType": "Primary tumor cell, Whole blood",
					"library:institute": {
						"itemsType": "AttributeValue",
						"items": ["NCI"]
					},
					"library:orsp": "TODO",
					"library:dataUseRestriction": "General Research Use",
					"library:datasetDepositor": "Chet Birger",
					"library:reference": "GRCh37/hg19",
					"library:datasetVersion": "V1-0_data",
					"library:datasetName": "TCGA_SARC_ControlledAccess",
					"library:dataCategory": {
						"itemsType": "AttributeValue",
						"items": ["Simple Nucleotide Variation", "Raw Sequencing data", "Copy Number Variation", "Expression Quantification", "DNA-Methylation", "Clinical phenotypes", "Biosample metadata"]
					},
					"library:dataFileFormats": {
						"itemsType": "AttributeValue",
						"items": ["TXT", "MAF", "BAM"]
					},
					"library:useLimitationOption": "skip",
					"library:datasetDescription": "This cohort is part of The Cancer Genome Atlas project (https://cancergenome.nih.gov/abouttcga/overview).  This cohort includes raw data and analysis of cancer patients samples by genomic DNA copy number arrays, DNA methylation, exome sequencing, mRNA arrays, microRNA sequencing and reverse phase protein arrays. De-identified patients’ clinical phenotypes and metadata are also included. For more information see the full TCGA cohorts publication list at: https://cancergenome.nih.gov/publications; Data description is also summarized at : https://TCGA_data.nci.nih.gov/docs/publications//tcga/datatype.html"
				},
				"createdBy": "adm.firec@gmail.com",
				"authDomainACLs": {
					"OWNER": {
						"groupName": "I_60074fb5-58cc-4b50-ab69-a1920e577429-OWNER"
					},
					"PROJECT_OWNER": {
						"groupName": "I_60074fb5-58cc-4b50-ab69-a1920e577429-PROJECT_OWNER"
					},
					"READER": {
						"groupName": "I_60074fb5-58cc-4b50-ab69-a1920e577429-READER"
					},
					"WRITER": {
						"groupName": "I_60074fb5-58cc-4b50-ab69-a1920e577429-WRITER"
					}
				},
				"bucketName": "fc-60074fb5-58cc-4b50-ab69-a1920e577429",
				"namespace": "broad-firecloud-tcga-alpha",
				"authorizationDomain": [{
					"membersGroupName": "TCGA-dbGaP-Authorized"
				}],
				"createdDate": "2017-03-31T19:58:29.963Z",
				"accessLevels": {
					"OWNER": {
						"groupName": "60074fb5-58cc-4b50-ab69-a1920e577429-OWNER"
					},
					"PROJECT_OWNER": {
						"groupName": "PROJECT_broad-firecloud-tcga-alpha-Owner"
					},
					"READER": {
						"groupName": "60074fb5-58cc-4b50-ab69-a1920e577429-READER"
					},
					"WRITER": {
						"groupName": "60074fb5-58cc-4b50-ab69-a1920e577429-WRITER"
					}
				}
			}
		}
		]
	}
}
