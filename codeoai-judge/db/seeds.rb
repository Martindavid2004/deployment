# CodoAI Judge Database Seeds
# This file seeds the database with only the 5 supported languages

require_relative "languages/codoai_active"

puts "Seeding CodoAI Judge database with supported languages..."

# Clear existing languages first
Language.delete_all

# Seed only our 5 supported languages
@languages.each do |language_data|
  language = Language.create!(
    id: language_data[:id],
    name: language_data[:name],
    is_archived: language_data[:is_archived],
    source_file: language_data[:source_file],
    compile_cmd: language_data[:compile_cmd],
    run_cmd: language_data[:run_cmd]
  )
  puts "✓ Created language: #{language.name} (ID: #{language.id})"
end

puts "✓ Successfully seeded #{Language.count} languages"
puts "\nSupported Languages:"
Language.all.each do |lang|
  puts "- #{lang.name} (ID: #{lang.id})"
end