require 'spec_helper'

describe Visualization::Heatmap do

  let(:table_name) { 'heatmap_table' }
  let(:schema_name) { 'test_schema3' }

  describe 'for gpdb', :greenplum_integration do
    let(:database) { GreenplumIntegration.real_database }
    let(:data_source_account) { GreenplumIntegration.real_account }

    context 'dataset is a table' do
      let(:dataset) { database.find_dataset_in_schema(table_name, schema_name) }

      it_behaves_like 'a heatmap visualization'
    end

    context 'dataset is a chorus view' do
      let(:dataset) do
        ChorusView.new({:name => 'CHORUS_VIEW',
                        :schema => database.schemas.find_by_name!(schema_name),
                        :query => "select * from #{table_name}"
                       }, :without_protection => true)
      end

      it_behaves_like 'a heatmap visualization'
    end
  end

  context 'for postgres', :postgres_integration do
    let(:data_source_account) { PostgresIntegration.real_account }
    let(:database) { PostgresIntegration.real_database }
    let(:dataset) { database.find_dataset_in_schema(table_name, schema_name) }

    it_behaves_like 'a heatmap visualization'
  end
end
