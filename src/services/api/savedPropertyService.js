export const savedPropertyService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "property_id_c" } },
          { field: { Name: "saved_date_c" } }
        ],
        orderBy: [
          {
            fieldName: "saved_date_c",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('saved_property_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(record => ({
        Id: record.Id,
        propertyId: record.property_id_c?.Id || record.property_id_c,
        savedDate: record.saved_date_c || new Date().toISOString().split('T')[0]
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching saved properties:", error?.response?.data?.message);
      } else {
        console.error("Error fetching saved properties:", error.message);
      }
      throw error;
    }
  },

  async save(propertyId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            property_id_c: parseInt(propertyId),
            saved_date_c: new Date().toISOString().split('T')[0]
          }
        ]
      };

      const response = await apperClient.createRecord('saved_property_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to save property ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord && successfulRecord.data) {
          return {
            Id: successfulRecord.data.Id,
            propertyId: parseInt(propertyId),
            savedDate: new Date().toISOString().split('T')[0]
          };
        }
      }

      throw new Error("Failed to save property");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error saving property:", error?.response?.data?.message);
      } else {
        console.error("Error saving property:", error.message);
      }
      throw error;
    }
  },

  async remove(propertyId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // First find the saved property record
      const findParams = {
        fields: [
          { field: { Name: "property_id_c" } }
        ],
        where: [
          {
            FieldName: "property_id_c",
            Operator: "EqualTo",
            Values: [parseInt(propertyId)]
          }
        ]
      };

      const findResponse = await apperClient.fetchRecords('saved_property_c', findParams);

      if (!findResponse.success) {
        console.error(findResponse.message);
        throw new Error(findResponse.message);
      }

      if (!findResponse.data || findResponse.data.length === 0) {
        throw new Error("Saved property not found");
      }

      const savedPropertyRecord = findResponse.data[0];
      
      const params = {
        RecordIds: [savedPropertyRecord.Id]
      };

      const response = await apperClient.deleteRecord('saved_property_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to remove saved property ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
      }

      return {
        Id: savedPropertyRecord.Id,
        propertyId: parseInt(propertyId),
        savedDate: savedPropertyRecord.saved_date_c
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error removing saved property:", error?.response?.data?.message);
      } else {
        console.error("Error removing saved property:", error.message);
      }
      throw error;
    }
  },

  async isPropertySaved(propertyId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "property_id_c" } }
        ],
        where: [
          {
            FieldName: "property_id_c",
            Operator: "EqualTo",
            Values: [parseInt(propertyId)]
          }
        ]
      };

      const response = await apperClient.fetchRecords('saved_property_c', params);

      if (!response.success) {
        console.error(response.message);
        return false;
      }

      return response.data && response.data.length > 0;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error checking saved property:", error?.response?.data?.message);
      } else {
        console.error("Error checking saved property:", error.message);
      }
      return false;
    }
  }
};