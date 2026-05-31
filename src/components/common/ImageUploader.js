import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../../contexts/ThemeContext';

const ACTION_VARIANTS = {
  primary: {
    backgroundColorKey: 'brandBlueSoft',
    borderColorKey: 'brandBlue',
    textColorKey: 'brandBlueDeep',
  },
  secondary: {
    backgroundColorKey: 'surfaceAlt',
    borderColorKey: 'borderStrong',
    textColorKey: 'text',
  },
  danger: {
    backgroundColorKey: 'dangerSoft',
    borderColorKey: 'danger',
    textColorKey: 'danger',
  },
};

const getImageFileName = (value) => {
  if (!value) {
    return 'No image selected';
  }

  if (typeof value === 'string') {
    if (value.startsWith('data:')) {
      return 'Inline image';
    }

    const cleanPath = value.split('?')[0];
    const segments = cleanPath.split('/');
    return segments[segments.length - 1] || 'Selected image';
  }

  if (typeof value === 'object') {
    if (value.fileName) {
      return value.fileName;
    }

    if (value.name) {
      return value.name;
    }

    if (value.uri) {
      const cleanPath = String(value.uri).split('?')[0];
      const segments = cleanPath.split('/');
      return segments[segments.length - 1] || 'Selected image';
    }
  }

  return 'Selected image';
};

const getPreviewSource = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return { uri: value };
  }

  if (value.uri) {
    return { uri: value.uri };
  }

  if (value.imageUrl) {
    return { uri: value.imageUrl };
  }

  if (value.imageURL) {
    return { uri: value.imageURL };
  }

  if (value.url) {
    return { uri: value.url };
  }

  return null;
};

const truncateText = (text, maxLength = 42) => {
  const value = String(text || '').trim();

  if (!value) {
    return '';
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
};

function ActionButton({ theme, styles, label, onPress, variant = 'secondary', disabled = false }) {
  const palette = ACTION_VARIANTS[variant] || ACTION_VARIANTS.secondary;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        {
          backgroundColor: theme.colors[palette.backgroundColorKey],
          borderColor: theme.colors[palette.borderColorKey],
        },
        disabled && styles.actionButtonDisabled,
      ]}
    >
      <Text style={[styles.actionButtonLabel, { color: theme.colors[palette.textColorKey] }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    card: {
      borderWidth: 1.1,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
      overflow: 'hidden',
    },
    header: {
      marginBottom: theme.spacing.sm,
    },
    label: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: theme.spacing.xs,
      textTransform: 'uppercase',
    },
    helper: {
      fontSize: 13,
      lineHeight: 19,
      marginTop: theme.spacing.xs,
    },
    previewShell: {
      borderWidth: 1,
      overflow: 'hidden',
    },
    previewPressable: {
      minHeight: 220,
    },
    previewImage: {
      width: '100%',
      minHeight: 220,
      backgroundColor: theme.colors.surfaceAlt,
    },
    placeholder: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 220,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
    },
    placeholderIcon: {
      alignItems: 'center',
      backgroundColor: theme.colors.primarySoft,
      borderRadius: theme.radii.pill,
      height: 56,
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      width: 56,
    },
    placeholderIconText: {
      fontSize: 24,
    },
    placeholderTitle: {
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.2,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    placeholderSubtitle: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
    },
    previewMeta: {
      marginTop: theme.spacing.sm,
    },
    previewMetaTitle: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.6,
      marginBottom: theme.spacing.xs,
      textTransform: 'uppercase',
    },
    previewMetaValue: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
    },
    previewMetaHint: {
      fontSize: 12,
      lineHeight: 18,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      backgroundColor: theme.withAlpha(theme.colors.background, 0.55),
      justifyContent: 'center',
    },
    actionsStack: {
      marginTop: theme.spacing.md,
    },
    actionButton: {
      alignItems: 'center',
      borderRadius: theme.radii.md,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 48,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    actionButtonLabel: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.2,
      textAlign: 'center',
    },
    actionButtonDisabled: {
      opacity: 0.6,
    },
  });

export default function ImageUploader({
  label = 'Image',
  helperText = '',
  value = null,
  onChange,
  onClear,
  allowCamera = true,
  allowGallery = true,
  allowEditing = true,
  aspect = [4, 3],
  base64 = false,
  exif = false,
  quality = 0.4,
  mediaTypes = ['images'],
  placeholderTitle = 'No image selected',
  placeholderSubtitle = 'Take a photo or choose one from your library.',
  cameraLabel = 'Take photo',
  galleryLabel = 'Choose from library',
  clearLabel = 'Remove image',
  cameraPermissionTitle = 'Camera permission needed',
  cameraPermissionBody = 'Allow camera access to take a photo.',
  libraryPermissionTitle = 'Photo permission needed',
  libraryPermissionBody = 'Allow photo library access to choose a photo.',
  imageErrorTitle = 'Image unavailable',
  imageErrorBody = 'We could not update the image right now.',
  disabled = false,
  style,
  labelStyle,
  helperStyle,
  previewStyle,
  previewImageStyle,
  placeholderStyle,
  actionsStyle,
  imageResizeMode = 'cover',
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [isPicking, setIsPicking] = useState(false);

  const previewSource = getPreviewSource(value);
  const previewLabel = truncateText(getImageFileName(value));
  const isBusy = disabled || isPicking;

  const runPicker = async ({
    requestPermission,
    launchPicker,
    permissionTitle,
    permissionBody,
  }) => {
    try {
      setIsPicking(true);

      const permission = await requestPermission();

      if (permission?.granted !== true && permission?.status !== 'granted') {
        Alert.alert(permissionTitle, permissionBody);
        return;
      }

      const result = await launchPicker();
      const asset = result?.assets?.[0];

      if (!result?.canceled && asset?.uri) {
        await Promise.resolve(onChange?.(asset, result));
      }
    } catch (error) {
      Alert.alert(imageErrorTitle, error?.message || imageErrorBody);
    } finally {
      setIsPicking(false);
    }
  };

  const handleCameraPick = async () => {
    if (!allowCamera || isBusy) {
      return;
    }

    await runPicker({
      requestPermission: () => ImagePicker.requestCameraPermissionsAsync(),
      launchPicker: () =>
        ImagePicker.launchCameraAsync({
          allowsEditing: allowEditing,
          aspect,
          base64,
          exif,
          mediaTypes,
          quality,
        }),
      permissionTitle: cameraPermissionTitle,
      permissionBody: cameraPermissionBody,
    });
  };

  const handleGalleryPick = async () => {
    if (!allowGallery || isBusy) {
      return;
    }

    await runPicker({
      requestPermission: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
      launchPicker: () =>
        ImagePicker.launchImageLibraryAsync({
          allowsEditing: allowEditing,
          aspect,
          base64,
          exif,
          mediaTypes,
          quality,
        }),
      permissionTitle: libraryPermissionTitle,
      permissionBody: libraryPermissionBody,
    });
  };

  const handlePreviewPress = async () => {
    if (isBusy) {
      return;
    }

    if (previewSource && allowGallery) {
      await handleGalleryPick();
      return;
    }

    if (previewSource && allowCamera) {
      await handleCameraPick();
      return;
    }

    if (allowGallery) {
      await handleGalleryPick();
      return;
    }

    if (allowCamera) {
      await handleCameraPick();
    }
  };

  const handleClear = () => {
    if (isBusy) {
      return;
    }

    onChange?.(null, null);
    onClear?.();
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.xl,
        },
        style,
      ]}
    >
      {label ? (
        <View style={styles.header}>
          <Text style={[styles.label, { color: theme.colors.textSoft }, labelStyle]}>{label}</Text>
          {helperText ? (
            <Text style={[styles.helper, { color: theme.colors.textMuted }, helperStyle]}>
              {helperText}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.previewShell,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: theme.colors.borderStrong,
            borderRadius: theme.radii.lg,
          },
          previewStyle,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={isBusy}
          onPress={handlePreviewPress}
          style={styles.previewPressable}
        >
          {previewSource ? (
            <Image
              source={previewSource}
              resizeMode={imageResizeMode}
              style={[styles.previewImage, previewImageStyle]}
            />
          ) : (
            <View style={[styles.placeholder, placeholderStyle]}>
              <View
                style={[
                  styles.placeholderIcon,
                  {
                    backgroundColor: theme.colors.primarySoft,
                  },
                ]}
              >
                <Text style={styles.placeholderIconText}>+</Text>
              </View>
              <Text style={[styles.placeholderTitle, { color: theme.colors.text }]}>
                {placeholderTitle}
              </Text>
              <Text style={[styles.placeholderSubtitle, { color: theme.colors.textSoft }]}>
                {placeholderSubtitle}
              </Text>
            </View>
          )}

          {isBusy ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={theme.colors.primaryDeep} size="small" />
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <View style={styles.previewMeta}>
        <Text style={[styles.previewMetaTitle, { color: theme.colors.textSoft }]}>
          {previewSource ? 'Selected image' : 'Ready to add'}
        </Text>
        <Text style={[styles.previewMetaValue, { color: theme.colors.text }]}>
          {previewSource ? previewLabel : 'No file picked yet'}
        </Text>
        <Text style={[styles.previewMetaHint, { color: theme.colors.textSoft }]}>
          {previewSource
            ? 'Tap the preview or use the buttons below to change it.'
            : 'Tap the preview or choose camera/gallery below to add one.'}
        </Text>
      </View>

      <View style={[styles.actionsStack, actionsStyle]}>
        {allowCamera ? (
          <ActionButton
            disabled={isBusy}
            label={cameraLabel}
            onPress={handleCameraPick}
            styles={styles}
            theme={theme}
            variant="primary"
          />
        ) : null}

        {allowGallery ? (
          <ActionButton
            disabled={isBusy}
            label={galleryLabel}
            onPress={handleGalleryPick}
            styles={styles}
            theme={theme}
            variant="secondary"
          />
        ) : null}

        {previewSource ? (
          <ActionButton
            disabled={isBusy}
            label={clearLabel}
            onPress={handleClear}
            styles={styles}
            theme={theme}
            variant="danger"
          />
        ) : null}
      </View>
    </View>
  );
}
