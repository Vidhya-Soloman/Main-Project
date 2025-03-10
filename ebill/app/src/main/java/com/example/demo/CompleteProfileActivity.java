package com.example.demo;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.SetOptions;

import java.util.HashMap;
import java.util.Map;

public class CompleteProfileActivity extends AppCompatActivity {

    private EditText fullNameEditText, consumerNumberEditText, phoneNumberEditText, transformerIdEditText, addressEditText, pinCodeEditText;
    private Spinner typeSpinner;
    private Button saveProfileButton;
    private FirebaseAuth mAuth;
    private FirebaseFirestore db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_complete_profile);

        // Initialize Firebase Auth and Firestore
        mAuth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();

        // Bind the views from the layout
        fullNameEditText = findViewById(R.id.full_name_edit_text);
        consumerNumberEditText = findViewById(R.id.consumer_number_edit_text);
        phoneNumberEditText = findViewById(R.id.phone_number_edit_text);
        transformerIdEditText = findViewById(R.id.transformer_id_edit_text);
        addressEditText = findViewById(R.id.address_edit_text);
        pinCodeEditText = findViewById(R.id.pin_code_edit_text);
        typeSpinner = findViewById(R.id.type_spinner);
        saveProfileButton = findViewById(R.id.save_profile_button);

        // Set up the Spinner for the "type" field
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this, R.array.type_options, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        typeSpinner.setAdapter(adapter);

        // Set onClickListener for the save button
        saveProfileButton.setOnClickListener(v -> saveUserProfile());
    }

    private void saveUserProfile() {
        // Get values from the input fields
        String fullName = fullNameEditText.getText().toString().trim();
        String consumerNumber = consumerNumberEditText.getText().toString().trim();
        String phoneNumber = phoneNumberEditText.getText().toString().trim();
        String transformerId = transformerIdEditText.getText().toString().trim();
        String address = addressEditText.getText().toString().trim();
        String pinCode = pinCodeEditText.getText().toString().trim();
        String type = typeSpinner.getSelectedItem().toString();

        // Validate if any fields are empty
        if (TextUtils.isEmpty(fullName) || TextUtils.isEmpty(consumerNumber) || TextUtils.isEmpty(phoneNumber) ||
                TextUtils.isEmpty(transformerId) || TextUtils.isEmpty(address) || TextUtils.isEmpty(pinCode)) {
            Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        // Get the current authenticated user
        FirebaseUser user = mAuth.getCurrentUser();
        if (user != null) {
            // Create a map to hold the profile data
            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("fullName", fullName);
            userProfile.put("consumerNumber", consumerNumber);
            userProfile.put("phoneNumber", phoneNumber);
            userProfile.put("transformerId", transformerId);
            userProfile.put("address", address);
            userProfile.put("pinCode", pinCode);
            userProfile.put("type", type);
            userProfile.put("email", user.getEmail());  // Add the user's email to the profile
            userProfile.put("profileComplete", true);  // Flag to indicate the profile is complete

            // Save user profile data to Firestore in the 'users' collection
            db.collection("users").document(user.getUid())
                    .set(userProfile, SetOptions.merge())  // Use merge to avoid overwriting other data
                    .addOnSuccessListener(aVoid -> {
                        // On success, navigate to the HomeActivity
                        startActivity(new Intent(CompleteProfileActivity.this, HomeActivity.class));
                        finish();  // Close the current activity
                    })
                    .addOnFailureListener(e -> {
                        // On failure, show a Toast with the error message
                        Toast.makeText(CompleteProfileActivity.this, "Error saving profile: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    });
        }
    }
}
