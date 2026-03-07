#!/usr/bin/env python3
"""
NeuroCode AI - Confusion Detection Model Training
Optimized for SageMaker Spot Instances
"""

import os
import json
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_recall_fscore_support, roc_auc_score
import boto3
from datetime import datetime

# SageMaker paths
SM_MODEL_DIR = os.environ.get('SM_MODEL_DIR', '/opt/ml/model')
SM_CHANNEL_TRAINING = os.environ.get('SM_CHANNEL_TRAINING', '/opt/ml/input/data/training')
SM_OUTPUT_DATA_DIR = os.environ.get('SM_OUTPUT_DATA_DIR', '/opt/ml/output/data')


class ConfusionDataset(Dataset):
    """Dataset for confusion detection"""
    
    def __init__(self, features, labels):
        self.features = torch.FloatTensor(features)
        self.labels = torch.FloatTensor(labels)
    
    def __len__(self):
        return len(self.features)
    
    def __getitem__(self, idx):
        return self.features[idx], self.labels[idx]


class ConfusionDetectorModel(nn.Module):
    """
    Multi-modal Confusion Detector
    Input: Code features + User behavior features
    Output: Confusion probability (0-1)
    """
    
    def __init__(self, input_dim=50, hidden_dims=[128, 64]):
        super(ConfusionDetectorModel, self).__init__()
        
        layers = []
        prev_dim = input_dim
        
        for hidden_dim in hidden_dims:
            layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.ReLU(),
                nn.BatchNorm1d(hidden_dim),
                nn.Dropout(0.3)
            ])
            prev_dim = hidden_dim
        
        layers.append(nn.Linear(prev_dim, 1))
        layers.append(nn.Sigmoid())
        
        self.network = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.network(x)


def load_data(data_path):
    """Load training data from S3"""
    print(f"Loading data from {data_path}")
    
    # Load JSON dataset
    with open(os.path.join(data_path, 'dataset.json'), 'r') as f:
        data = json.load(f)
    
    features = np.array(data['features'])
    labels = np.array(data['labels'])
    
    print(f"Loaded {len(features)} samples")
    print(f"Feature shape: {features.shape}")
    print(f"Positive samples: {labels.sum()}, Negative samples: {len(labels) - labels.sum()}")
    
    return features, labels


def train_model(model, train_loader, val_loader, epochs=20, lr=0.001, device='cpu'):
    """Train the confusion detection model"""
    
    criterion = nn.BCELoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=0.01)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=3)
    
    best_val_loss = float('inf')
    best_model_state = None
    
    for epoch in range(epochs):
        # Training
        model.train()
        train_loss = 0.0
        train_preds = []
        train_labels = []
        
        for features, labels in train_loader:
            features, labels = features.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(features).squeeze()
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            train_preds.extend(outputs.detach().cpu().numpy())
            train_labels.extend(labels.cpu().numpy())
        
        train_loss /= len(train_loader)
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_preds = []
        val_labels = []
        
        with torch.no_grad():
            for features, labels in val_loader:
                features, labels = features.to(device), labels.to(device)
                
                outputs = model(features).squeeze()
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                val_preds.extend(outputs.cpu().numpy())
                val_labels.extend(labels.cpu().numpy())
        
        val_loss /= len(val_loader)
        scheduler.step(val_loss)
        
        # Calculate metrics
        val_preds_binary = (np.array(val_preds) > 0.5).astype(int)
        precision, recall, f1, _ = precision_recall_fscore_support(
            val_labels, val_preds_binary, average='binary'
        )
        auc = roc_auc_score(val_labels, val_preds)
        
        print(f"Epoch {epoch+1}/{epochs}")
        print(f"  Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
        print(f"  Precision: {precision:.4f}, Recall: {recall:.4f}, F1: {f1:.4f}, AUC: {auc:.4f}")
        
        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_model_state = model.state_dict().copy()
            print(f"  New best model saved!")
    
    # Load best model
    model.load_state_dict(best_model_state)
    return model


def save_model(model, model_dir):
    """Save model for deployment"""
    print(f"Saving model to {model_dir}")
    
    # Save PyTorch model
    model_path = os.path.join(model_dir, 'confusion_detector.pth')
    torch.save({
        'model_state_dict': model.state_dict(),
        'model_architecture': {
            'input_dim': 50,
            'hidden_dims': [128, 64]
        },
        'training_date': datetime.now().isoformat(),
        'version': '1.0.0'
    }, model_path)
    
    # Save model metadata
    metadata = {
        'model_name': 'confusion_detector',
        'model_type': 'binary_classification',
        'input_features': 50,
        'output_classes': 1,
        'framework': 'pytorch',
        'version': '1.0.0'
    }
    
    with open(os.path.join(model_dir, 'metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print("Model saved successfully")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--epochs', type=int, default=20)
    parser.add_argument('--batch-size', type=int, default=64)
    parser.add_argument('--lr', type=float, default=0.001)
    parser.add_argument('--input-dim', type=int, default=50)
    args = parser.parse_args()
    
    print("=" * 60)
    print("NeuroCode AI - Confusion Detection Model Training")
    print("=" * 60)
    print(f"Epochs: {args.epochs}")
    print(f"Batch Size: {args.batch_size}")
    print(f"Learning Rate: {args.lr}")
    print(f"Input Dimension: {args.input_dim}")
    print("=" * 60)
    
    # Set device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Load data
    features, labels = load_data(SM_CHANNEL_TRAINING)
    
    # Split data
    X_train, X_val, y_train, y_val = train_test_split(
        features, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    # Create datasets
    train_dataset = ConfusionDataset(X_train, y_train)
    val_dataset = ConfusionDataset(X_val, y_val)
    
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False)
    
    # Create model
    model = ConfusionDetectorModel(input_dim=args.input_dim).to(device)
    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    # Train model
    model = train_model(model, train_loader, val_loader, args.epochs, args.lr, device)
    
    # Save model
    save_model(model, SM_MODEL_DIR)
    
    print("=" * 60)
    print("Training completed successfully!")
    print("=" * 60)


if __name__ == '__main__':
    main()
