// <!--change by Amol vaity-->
// <!--dynamic form screen-->
// <!--All control are developed from js file-->
sap.ui.define([
	// "sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/comp/smartform/SmartForm",
	"sap/ui/comp/smartform/Layout",
	"sap/ui/comp/smartform/ColumnLayout",
	"sap/ui/comp/smartform/Group",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, History, SmartForm, Layout, ColumnLayout, Group, JSONModel, BusyIndicator, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("fi.pms.solution.ZFI_PMS_SOL_PREVIEW.controller.View1", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.smartTable
		 */
		onInit: function () {
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var compo = sap.ui.component(sComponentId);
			this._onObjectMatched(compo.getComponentData().startupParameters.processId[0], compo.getComponentData().startupParameters.projectId[
					0], compo.getComponentData().startupParameters.projectDesc[0], compo.getComponentData().startupParameters.processDesc[0],
				compo.getComponentData().startupParameters.Preview[0]);

		},

		_onObjectMatched: function (processId, projId, projectDesc, processDesc, preview) {
			//BOC---Happy
			if (preview === "true") {
				this.preview = true;
			} else {
				this.preview = false;
			}
			this.SmartFormCollection = [];
			projectDesc = decodeURIComponent(projectDesc);
			processDesc = decodeURIComponent(processDesc);
			var model = new JSONModel();
			if (this.preview) {
				model.setProperty("/UserControlVisibility", false);
			} else {
				model.setProperty("/UserControlVisibility", true);
			}
			this.getView().setModel(model, "VisibilityModel");
			this.getView().getModel("viewData").setProperty("/ProjTitle", projectDesc);
			this.getView().getModel("viewData").setProperty("/processTitle", processDesc);
			this.getView().getModel("viewData").setProperty("/ProjId", projId);
			this.getView().getModel("viewData").setProperty("/processId", processId);
			//EOC---Happy
			this.getView().setBusy(true);
			this.getView().getModel("viewData").setProperty("/ProjTitle", projectDesc);
			this.getView().getModel("viewData").setProperty("/processTitle", processDesc);
			var f = [];
			f.push(new sap.ui.model.Filter("Projid", "EQ", projId));
			f.push(new sap.ui.model.Filter("Process", "EQ", processId));
			var paramertes = {
				filters: f,
				success: function (oData) {
					this.getView().setBusy(false);
					this.getView().getModel("dynamicFormModel").setData(oData);
					this.oVirtualEntryContext = this.getView().getModel().createEntry("DynEntItemSet");
					this._createSmartFormElements();

				}.bind(this),
				error: function () {
					this.getView().setBusy(false);
				}
			};
			this.getView().getModel("staticModel").read("/ProcessMasterSet", paramertes);

		},
		_createSmartFormElements: function () {

			this.getView().setBusy(true);
			//this is the reponse data of preview service, using as metadata to create all the controls
			var aFormData = this.getView().getModel("dynamicFormModel").getData().results;
			//smartFormContainer container 
			var smartFormContainer = this.getView().byId("smartFormContainer");
			// removing all the controls in smartFormContainer
			smartFormContainer.removeAllSections();
			//calling a function to creatie smart form or talble control according to sectionType
			var smartForm = this._createSectionControl(aFormData[0].SectionType);

			if (aFormData[0].SectionType.toUpperCase() === "FORM") {
				// if section type is form creating group with header
				var oGroup = new Group({
					// "label": aFormData[0].SectionName
				});
			} else if (aFormData[0].SectionType.toUpperCase() === "TABLE") {
				// if section type is Table setting header to table and creating columnlistitem
				// smartForm.setHeaderText(aFormData[0].SectionName);
				var columnList = new sap.m.ColumnListItem({

				});
			}

			//logic to read all the fields aFormData and creating smartfields smartfrom and table
			var sSecSeqNo = parseInt(aFormData[0].SectionSeqNum);
			for (var i = 0; i < aFormData.length; i++) {
				if (aFormData[i].Fieldname !== "MANDT" && aFormData[i].Fieldname !== "PROJECT_ID" && aFormData[i].Fieldname !== "PROCESS_ID") {

					if (sSecSeqNo !== parseInt(aFormData[i].SectionSeqNum)) {
						sSecSeqNo = parseInt(aFormData[i].SectionSeqNum);
						if (aFormData[i - 1].SectionType.toUpperCase() === "FORM") {
							smartForm.addGroup(oGroup);
							this._createObjectPageSection(smartForm, aFormData[i - 1].SectionName);
							// smartFormContainer.addItem(smartForm);
						} else if (aFormData[i - 1].SectionType.toUpperCase() === "TABLE") {
							smartForm.addItem(columnList);
							// smartFormContainer.addItem(smartForm);
							this._createObjectPageSection(smartForm, aFormData[i - 1].SectionName);
						}
						smartForm = this._createSectionControl(aFormData[i].SectionType);
						if (aFormData[i].SectionType.toUpperCase() === "FORM") {
							var oGroup = new Group({
								// "label": aFormData[i].SectionName
							});
						} else if (aFormData[i].SectionType.toUpperCase() === "TABLE") {
							// smartForm.setHeaderText(aFormData[i].SectionName);
							var columnList = new sap.m.ColumnListItem({

							});
						}

					}
					if (aFormData[i].SectionType.toUpperCase() === "FORM") {
						var oSmartField = new sap.ui.comp.smartfield.SmartField({
							"value": '{' + aFormData[i].Fieldname + '}'
								// "value": "{PROJECT_ID}"
						});
						var oGroupElement = new sap.ui.comp.smartform.GroupElement();
						oGroupElement.addElement(oSmartField);
						oGroup.addGroupElement(oGroupElement);
					} else if (aFormData[i].SectionType.toUpperCase() === "TABLE") {

						var column = new sap.m.Column({
							header: new sap.m.Text({
								text: aFormData[i].LabelName
							})
						});
						columnList.addCell(
							new sap.ui.comp.smartfield.SmartField({
								"value": '{' + aFormData[i].Fieldname + '}'
							})
						);
						smartForm.addColumn(column);
					}

				}
			}
			// var oSmartField = new sap.ui.comp.smartfield.SmartField({
			// 	"value": "{TEST_CB}"
			// });
			// var oGroupElement = new sap.ui.comp.smartform.GroupElement();

			// oGroupElement.addElement(oSmartField);
			// oGroup.addGroupElement(oGroupElement);
			if (aFormData[aFormData.length - 1].SectionType.toUpperCase() === "FORM") {
				smartForm.addGroup(oGroup);
				// smartFormContainer.addItem(smartForm);
				this._createObjectPageSection(smartForm, aFormData[aFormData.length - 1].SectionName);
			} else if (aFormData[aFormData.length - 1].SectionType.toUpperCase() === "TABLE") {
				smartForm.addItem(columnList);
				// smartFormContainer.addItem(smartForm);
				this._createObjectPageSection(smartForm, aFormData[aFormData.length - 1].SectionName);
			}
			// smartForm.addGroup(oGroup);
			this.getView().setBusy(false);
			// this.hideBusyDialog();
		},

		_createSectionControl: function (sectionType) {
			var oControl;
			if (sectionType.toUpperCase() === "FORM") {
				oControl = new sap.ui.comp.smartform.SmartForm({
					// id: "smartFormColumn",
					editTogglable: false,
					entityType: "DynEntItem",
					editable: true,
					layout: new sap.ui.comp.smartform.ColumnLayout({
						columnsXL: 4,
						columnsL: 3,
						columnsM: 2,
						labelCellsLarge: 4,
						emptyCellsLarge: 0
					}),
					useHorizontalLayout: false
				});
				this.SmartFormCollection.push(oControl);
				if (this.preview) {
					oControl.addStyleClass("pointerClass");
				}
				oControl.setBindingContext(this.oVirtualEntryContext);
				return oControl;
			} else if (sectionType.toUpperCase() === "TABLE") {
				oControl = new sap.m.Table({
					inset: false
				});
				if (this.preview) {
					oControl.addStyleClass("pointerClass");
				}
				oControl.setBindingContext(this.oVirtualEntryContext);
				return oControl;
			}

		},
		_createObjectPageSection: function (oControl, SectionName) {

			var objectPageSection = new sap.uxap.ObjectPageSection({
				title: SectionName,
				subSections: new sap.uxap.ObjectPageSubSection({
					blocks: oControl
				})
			});
			this.getView().byId("smartFormContainer").addSection(objectPageSection);

		},

		onUserFormSave: function (oEvent) {
			var mandatFlag = false;
			for (var i = 0; i < this.SmartFormCollection.length; i++) {
				if (this.SmartFormCollection[i].check().length > 0) {
					mandatFlag = true;
					MessageToast.show(this.getI18nText("fillMandatFields"));
					break;
				}
			}
			if (!mandatFlag) {
				var changedData = this.getView().getModel().getProperty(this.oVirtualEntryContext.sPath);
				if (changedData.ACT_TS_COMP_DT < changedData.ACT_TS_ST_DT) {
					MessageToast.show("Act TS Comp Date can not be less than Act TS Start Date");
					return;
				}
				var model = this.getView().getModel("viewData");
				model.getProperty("/ProjId");
				model.getProperty("/processId");
				var ProjectId = model.getProperty("/ProjId");
				var ProcessId = model.getProperty("/processId");
				changedData.PROJECT_ID = ProjectId;
				changedData.PROCESS_ID = ProcessId;
				delete changedData.__metadata;
				var body = {
					PROJECT_ID: ProjectId,
					PROCESS_ID: ProcessId,
					Nav_DynEntToDynEntItem: [changedData]
				};

				BusyIndicator.show(); //Starting Busy Indicator
				this.getOwnerComponent().getModel().create("/DynEntSet", body, {
					success: function (oData, response) {
						BusyIndicator.hide(); //Hiding Busy Indicator
						MessageBox.success(
							"Saved Successfully. Do you want to create another RICEF?", {
								actions: [MessageBox.Action.YES, MessageBox.Action.NO],
								onClose: function (sAction) {
									if (sAction === MessageBox.Action.YES) {
										location.reload();
									} else if (sAction === MessageBox.Action.NO) {
										window.close();
									}
								}
							}
						);
					},
					error: function (oError) {
						BusyIndicator.hide(); //Hiding Busy Indicator
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageBox.error(msg); //Displaying Error Message in Dialog Box
					}
				});

			}
		},

		//Get Text from I18n
		getI18nText: function (textId) {
			return this.getView().getModel("i18n").getResourceBundle().getText(textId);
		},

		_callCrossApp: function () {
			// this.getView().setModel(this.getOwnerComponent().getModel());
			var parameters = {
				success: function () {
					this.getView().setBusy(false);
					var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

					// generate the Hash 
					var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
						target: {
							semanticObject: "ZFI_PMS_SEM",
							action: "display"
						}
					})) || "";
					//Generate a  URL for the second application
					/*var url = window.location.href.split('#')[0] + hash;
					//Navigate to second app
					sap.m.URLHelper.redirect(url, true);*/

					oCrossAppNavigator.toExternal({
						target: {
							shellHash: hash
						}
					}); // navigate to Supplier application
				}.bind(this),
				error: function () {
					this.getView().setBusy(false);
				}.bind(this)
			};
			this.getView().getModel().read("/DynEntSet", parameters);

		},

		onBack: function () {

			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				window.close();
			}
		}

	});

});