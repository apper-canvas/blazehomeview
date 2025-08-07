export const propertyService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "property_type_c" } },
          { field: { Name: "bedrooms_c" } },
          { field: { Name: "bathrooms_c" } },
          { field: { Name: "square_feet_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "city_c" } },
          { field: { Name: "state_c" } },
          { field: { Name: "zip_c" } },
          { field: { Name: "year_built_c" } },
          { field: { Name: "amenities_c" } },
          { field: { Name: "images_c" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('property_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform database records to match frontend expectations
      return response.data.map(record => ({
        Id: record.Id,
        title: record.title_c || record.Name,
        price: parseFloat(record.price_c) || 0,
        address: {
          street: record.address_c || '',
          unit: '',
          city: record.city_c || '',
          state: record.state_c || '',
          zipCode: record.zip_c || ''
        },
        bedrooms: parseInt(record.bedrooms_c) || 0,
        bathrooms: parseInt(record.bathrooms_c) || 0,
        squareFeet: parseInt(record.square_feet_c) || 0,
        propertyType: record.property_type_c || 'House',
        images: record.images_c ? record.images_c.split(',').map(url => url.trim()) : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'],
        description: record.description_c || '',
        features: record.amenities_c ? record.amenities_c.split(',').map(f => f.trim()) : [],
        coordinates: { lat: 0, lng: 0 },
        listingDate: record.CreatedOn ? record.CreatedOn.split('T')[0] : new Date().toISOString().split('T')[0]
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching properties:", error?.response?.data?.message);
      } else {
        console.error("Error fetching properties:", error.message);
      }
      throw error;
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "property_type_c" } },
          { field: { Name: "bedrooms_c" } },
          { field: { Name: "bathrooms_c" } },
          { field: { Name: "square_feet_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "city_c" } },
          { field: { Name: "state_c" } },
          { field: { Name: "zip_c" } },
          { field: { Name: "year_built_c" } },
          { field: { Name: "amenities_c" } },
          { field: { Name: "images_c" } },
          { field: { Name: "CreatedOn" } }
        ]
      };

      const response = await apperClient.getRecordById('property_c', parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error("Property not found");
      }

      const record = response.data;
      return {
        Id: record.Id,
        title: record.title_c || record.Name,
        price: parseFloat(record.price_c) || 0,
        address: {
          street: record.address_c || '',
          unit: '',
          city: record.city_c || '',
          state: record.state_c || '',
          zipCode: record.zip_c || ''
        },
        bedrooms: parseInt(record.bedrooms_c) || 0,
        bathrooms: parseInt(record.bathrooms_c) || 0,
        squareFeet: parseInt(record.square_feet_c) || 0,
        propertyType: record.property_type_c || 'House',
        images: record.images_c ? record.images_c.split(',').map(url => url.trim()) : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'],
        description: record.description_c || '',
        features: record.amenities_c ? record.amenities_c.split(',').map(f => f.trim()) : [],
        coordinates: { lat: 0, lng: 0 },
        listingDate: record.CreatedOn ? record.CreatedOn.split('T')[0] : new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching property:", error?.response?.data?.message);
      } else {
        console.error("Error fetching property:", error.message);
      }
      throw error;
    }
  },

  async searchProperties(filters) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const whereConditions = [];

      if (filters.priceMin) {
        whereConditions.push({
          FieldName: "price_c",
          Operator: "GreaterThanOrEqualTo",
          Values: [filters.priceMin.toString()]
        });
      }
      if (filters.priceMax) {
        whereConditions.push({
          FieldName: "price_c",
          Operator: "LessThanOrEqualTo",
          Values: [filters.priceMax.toString()]
        });
      }
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        whereConditions.push({
          FieldName: "property_type_c",
          Operator: "ExactMatch",
          Values: filters.propertyTypes
        });
      }
      if (filters.bedroomsMin) {
        whereConditions.push({
          FieldName: "bedrooms_c",
          Operator: "GreaterThanOrEqualTo",
          Values: [filters.bedroomsMin.toString()]
        });
      }
      if (filters.bathroomsMin) {
        whereConditions.push({
          FieldName: "bathrooms_c",
          Operator: "GreaterThanOrEqualTo",
          Values: [filters.bathroomsMin.toString()]
        });
      }
      if (filters.squareFeetMin) {
        whereConditions.push({
          FieldName: "square_feet_c",
          Operator: "GreaterThanOrEqualTo",
          Values: [filters.squareFeetMin.toString()]
        });
      }
      if (filters.location) {
        whereConditions.push({
          FieldName: "city_c",
          Operator: "Contains",
          Values: [filters.location]
        });
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "property_type_c" } },
          { field: { Name: "bedrooms_c" } },
          { field: { Name: "bathrooms_c" } },
          { field: { Name: "square_feet_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "city_c" } },
          { field: { Name: "state_c" } },
          { field: { Name: "zip_c" } },
          { field: { Name: "year_built_c" } },
          { field: { Name: "amenities_c" } },
          { field: { Name: "images_c" } },
          { field: { Name: "CreatedOn" } }
        ],
        where: whereConditions,
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('property_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(record => ({
        Id: record.Id,
        title: record.title_c || record.Name,
        price: parseFloat(record.price_c) || 0,
        address: {
          street: record.address_c || '',
          unit: '',
          city: record.city_c || '',
          state: record.state_c || '',
          zipCode: record.zip_c || ''
        },
        bedrooms: parseInt(record.bedrooms_c) || 0,
        bathrooms: parseInt(record.bathrooms_c) || 0,
        squareFeet: parseInt(record.square_feet_c) || 0,
        propertyType: record.property_type_c || 'House',
        images: record.images_c ? record.images_c.split(',').map(url => url.trim()) : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'],
        description: record.description_c || '',
        features: record.amenities_c ? record.amenities_c.split(',').map(f => f.trim()) : [],
        coordinates: { lat: 0, lng: 0 },
        listingDate: record.CreatedOn ? record.CreatedOn.split('T')[0] : new Date().toISOString().split('T')[0]
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error searching properties:", error?.response?.data?.message);
      } else {
        console.error("Error searching properties:", error.message);
      }
      throw error;
    }
  }
};