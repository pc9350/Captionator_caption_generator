import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CaptionTone,
  CaptionLength,
  SpicyLevel,
  CaptionStyle,
  CreativeLanguageOptions,
  TONE_OPTIONS,
  LENGTH_OPTIONS,
  SPICY_OPTIONS,
  STYLE_OPTIONS,
} from '../types/caption';

interface CaptionOptionsProps {
  tone: CaptionTone;
  setTone: (tone: CaptionTone) => void;
  includeHashtags: boolean;
  setIncludeHashtags: (include: boolean) => void;
  includeEmojis: boolean;
  setIncludeEmojis: (include: boolean) => void;
  captionLength: CaptionLength;
  setCaptionLength: (length: CaptionLength) => void;
  spicyLevel: SpicyLevel;
  setSpicyLevel: (level: SpicyLevel) => void;
  captionStyle: CaptionStyle;
  setCaptionStyle: (style: CaptionStyle) => void;
  creativeLanguageOptions: CreativeLanguageOptions;
  setCreativeLanguageOptions: (options: CreativeLanguageOptions) => void;
}

const CaptionOptions: React.FC<CaptionOptionsProps> = ({
  tone,
  setTone,
  includeHashtags,
  setIncludeHashtags,
  includeEmojis,
  setIncludeEmojis,
  captionLength,
  setCaptionLength,
  spicyLevel,
  setSpicyLevel,
  captionStyle,
  setCaptionStyle,
  creativeLanguageOptions,
  setCreativeLanguageOptions,
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleCreativeOptionChange = (option: keyof CreativeLanguageOptions, value: boolean) => {
    setCreativeLanguageOptions({
      ...creativeLanguageOptions,
      [option]: value,
    });
  };

  return (
    <View style={styles.container}>
      {/* Caption Tone Options */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="chatbubble-outline" size={20} color="#4338ca" />
          <Text style={styles.sectionTitle}>Caption Tone</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toneOptionsContainer}
        >
          {TONE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.toneOption,
                tone === option.id && styles.toneOptionSelected,
              ]}
              onPress={() => setTone(option.id as CaptionTone)}
            >
              <Text 
                style={[
                  styles.toneOptionText,
                  tone === option.id && styles.toneOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Caption Length Options */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="text-outline" size={20} color="#4338ca" />
          <Text style={styles.sectionTitle}>Caption Length</Text>
        </View>
        <View style={styles.lengthOptionsContainer}>
          {LENGTH_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.lengthOption,
                captionLength === option.id && styles.lengthOptionSelected,
              ]}
              onPress={() => setCaptionLength(option.id as CaptionLength)}
            >
              <Text 
                style={[
                  styles.lengthOptionText,
                  captionLength === option.id && styles.lengthOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.lengthOptionDescription}>
                {option.description}
              </Text>
              {captionLength === option.id && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Basic Options */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="options-outline" size={20} color="#4338ca" />
          <Text style={styles.sectionTitle}>Basic Options</Text>
        </View>
        
        <View style={styles.toggleOption}>
          <Text style={styles.toggleOptionText}>Include Hashtags</Text>
          <Switch
            value={includeHashtags}
            onValueChange={setIncludeHashtags}
            trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
            thumbColor={includeHashtags ? '#4338ca' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.toggleOption}>
          <Text style={styles.toggleOptionText}>Include Emojis</Text>
          <Switch
            value={includeEmojis}
            onValueChange={setIncludeEmojis}
            trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
            thumbColor={includeEmojis ? '#4338ca' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Advanced Options Toggle */}
      <TouchableOpacity 
        style={styles.advancedOptionsToggle}
        onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
      >
        <Text style={styles.advancedOptionsToggleText}>
          {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </Text>
        <Ionicons 
          name={showAdvancedOptions ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#4338ca" 
        />
      </TouchableOpacity>

      {/* Advanced Options */}
      {showAdvancedOptions && (
        <>
          {/* Spicy Level Options */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flame-outline" size={20} color="#4338ca" />
              <Text style={styles.sectionTitle}>Spice Level</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.spicyOptionsContainer}
            >
              {SPICY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.spicyOption,
                    spicyLevel === option.id && styles.spicyOptionSelected,
                  ]}
                  onPress={() => setSpicyLevel(option.id as SpicyLevel)}
                >
                  <Text 
                    style={[
                      styles.spicyOptionText,
                      spicyLevel === option.id && styles.spicyOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text 
                    style={[
                      styles.spicyOptionDescription,
                      spicyLevel === option.id && styles.spicyOptionDescriptionSelected,
                    ]}
                  >
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Caption Style Options */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="color-palette-outline" size={20} color="#4338ca" />
              <Text style={styles.sectionTitle}>Caption Style</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.styleOptionsContainer}
            >
              {STYLE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.styleOption,
                    captionStyle === option.id && styles.styleOptionSelected,
                  ]}
                  onPress={() => setCaptionStyle(option.id as CaptionStyle)}
                >
                  <Text 
                    style={[
                      styles.styleOptionText,
                      captionStyle === option.id && styles.styleOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text 
                    style={[
                      styles.styleOptionDescription,
                      captionStyle === option.id && styles.styleOptionDescriptionSelected,
                    ]}
                  >
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Creative Language Options */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={20} color="#4338ca" />
              <Text style={styles.sectionTitle}>Creative Language</Text>
            </View>
            
            <View style={styles.toggleOption}>
              <Text style={styles.toggleOptionText}>Word Invention</Text>
              <Switch
                value={creativeLanguageOptions.wordInvention}
                onValueChange={(value) => handleCreativeOptionChange('wordInvention', value)}
                trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
                thumbColor={creativeLanguageOptions.wordInvention ? '#4338ca' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.toggleOption}>
              <Text style={styles.toggleOptionText}>Alliteration</Text>
              <Switch
                value={creativeLanguageOptions.alliteration}
                onValueChange={(value) => handleCreativeOptionChange('alliteration', value)}
                trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
                thumbColor={creativeLanguageOptions.alliteration ? '#4338ca' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.toggleOption}>
              <Text style={styles.toggleOptionText}>Rhyming</Text>
              <Switch
                value={creativeLanguageOptions.rhyming}
                onValueChange={(value) => handleCreativeOptionChange('rhyming', value)}
                trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
                thumbColor={creativeLanguageOptions.rhyming ? '#4338ca' : '#f4f3f4'}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  toneOptionsContainer: {
    paddingVertical: 8,
  },
  toneOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toneOptionSelected: {
    backgroundColor: '#4338ca',
    borderColor: '#4338ca',
  },
  toneOptionText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 14,
  },
  toneOptionTextSelected: {
    color: 'white',
  },
  lengthOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lengthOption: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  lengthOptionSelected: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  lengthOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  lengthOptionTextSelected: {
    color: '#4338ca',
  },
  lengthOptionDescription: {
    fontSize: 12,
    color: '#9ca3af',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4338ca',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  toggleOptionText: {
    fontSize: 14,
    color: '#4b5563',
  },
  advancedOptionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  advancedOptionsToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338ca',
    marginRight: 4,
  },
  spicyOptionsContainer: {
    paddingVertical: 8,
  },
  spicyOption: {
    width: 120,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  spicyOptionSelected: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  spicyOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  spicyOptionTextSelected: {
    color: '#ef4444',
  },
  spicyOptionDescription: {
    fontSize: 12,
    color: '#9ca3af',
  },
  spicyOptionDescriptionSelected: {
    color: '#ef4444',
    opacity: 0.8,
  },
  styleOptionsContainer: {
    paddingVertical: 8,
  },
  styleOption: {
    width: 150,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  styleOptionSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
  },
  styleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  styleOptionTextSelected: {
    color: '#0ea5e9',
  },
  styleOptionDescription: {
    fontSize: 12,
    color: '#9ca3af',
  },
  styleOptionDescriptionSelected: {
    color: '#0ea5e9',
    opacity: 0.8,
  },
});

export default CaptionOptions; 