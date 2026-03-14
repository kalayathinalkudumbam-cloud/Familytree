import React, { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';
import * as f3 from 'family-chart';
import 'family-chart/styles/family-chart.css';
import { useAuth } from "../../context/AuthContext";
import { toast } from 'react-toastify';
import './FamilyTree.css';

// We no longer import familyData from the local JSON file.
// We will fetch it from Cloudflare instead.


export default function FamilyTree() {
    const { userRole } = useAuth();
    const containerRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const navRef = useRef(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // NEW STATES FOR CLOUDFLARE
    const [treeData, setTreeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // CONFIGURATION (Using Environment Variables)
    const CLOUDFLARE_WORKER_URL = process.env.REACT_APP_CLOUDFLARE_WORKER_URL;
    const ADMIN_SECRET_PASSWORD = process.env.REACT_APP_ADMIN_SECRET_PASSWORD;
    const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    // 1. FETCH DATA FROM CLOUDFLARE ON LOAD
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(CLOUDFLARE_WORKER_URL);
                const data = await response.json();

                // If Worker returns the "No data yet" object, handle it
                if (data.message === "No data yet") {
                    setTreeData([]);
                } else {
                    setTreeData(data);
                }
            } catch (error) {
                console.error("Error fetching from Cloudflare:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [resetKey]);

    // Add reset function to global scope for debugging
    useEffect(() => {
        window.resetFamilyTreeData = () => {
            // For this version, reset would ideally mean pushing the original JSON back to Cloudflare.
            // For now, we'll just clear cache.
            localStorage.removeItem('familyTreeData');
            console.log('Local Cache Reset');
            window.location.reload();
        };
    }, []);

    useEffect(() => {
        // Only initialize if we have a container AND we have fetched the treeData
        if (!containerRef.current || !treeData) return;

        const initializeChart = () => {
            const user_type = userRole === 'admin1' ? 'admin' : 'user';

            // Clean up any existing chart
            if (chartInstanceRef.current) {
                d3.select('#FamilyChart').selectAll('*').remove();
                chartInstanceRef.current = null;
            }

            // We use the treeData fetched from Cloudflare

            // 1. EXTRACT SEARCH PARAMETERS FROM URL
            const params = new URLSearchParams(window.location.search);
            const searchName = params.get('name');

            // Use full treeData for rendering - the search effect will handle the focus/lineage
            const f3Chart = f3.createChart('#FamilyChart', treeData)
                .setTransitionTime(1000)
                .setCardXSpacing(250)
                .setCardYSpacing(150);

            chartInstanceRef.current = f3Chart;

            // 2. HELPER TO MATCH NAMES
            const getPersonName = (p) => {
                const first = p?.data?.['first name'] ?? p?.['first name'] ?? '';
                const last = p?.data?.['last name'] ?? p?.['last name'] ?? '';
                return `${first} ${last}`.trim();
            };

            const getLabel = (d) => {
                const first = d?.data?.data?.['first name'] ?? d?.data?.['first name'] ?? '';
                const last = d?.data?.data?.['last name'] ?? d?.data?.['last name'] ?? '';
                const name = `${first} ${last}`.trim();
                return name || (d?.data?.id ?? d?.id ?? '');
            };

            try {
                f3Chart.setPersonDropdown(getLabel, {
                    cont: navRef.current,
                    placeholder: 'Search person...',
                    onSelect: (personId) => {
                        f3Chart.updateMainId(personId);
                        f3Chart.updateTree({ initial: false });
                    }
                });

                // Fix dropdown visibility - hide when empty, show when active
                setTimeout(() => {
                    const autocompleteContainer = navRef.current?.querySelector('.f3-autocomplete');
                    const autocompleteInput = navRef.current?.querySelector('.f3-autocomplete input');
                    const autocompleteItems = navRef.current?.querySelector('.f3-autocomplete-items');

                    if (autocompleteContainer && autocompleteInput && autocompleteItems) {
                        // Hide dropdown initially
                        autocompleteItems.style.display = 'none';

                        // Function to check if dropdown should be visible

                        // Hide dropdown
                        const hideDropdown = () => {
                            autocompleteItems.style.display = 'none';
                            autocompleteContainer.classList.remove('f3-autocomplete-active');
                        };

                        // Show dropdown if it has items
                        const showDropdown = () => {
                            if (autocompleteItems.children.length > 0) {
                                autocompleteItems.style.display = 'block';
                                autocompleteContainer.classList.add('f3-autocomplete-active');
                            }
                        };

                        // Show/hide on input focus/blur
                        autocompleteInput.addEventListener('focus', () => {
                            if (autocompleteItems.children.length > 0) {
                                showDropdown();
                            }
                        });

                        autocompleteInput.addEventListener('blur', () => {
                            // Delay to allow click events on items to register
                            setTimeout(() => {
                                if (!autocompleteContainer.contains(document.activeElement)) {
                                    hideDropdown();
                                }
                            }, 200);
                        });

                        // Monitor for changes in dropdown items
                        const observer = new MutationObserver(() => {
                            if (autocompleteItems.children.length > 0) {
                                // Only show if input is focused or container is active
                                if (autocompleteInput === document.activeElement ||
                                    autocompleteContainer.classList.contains('f3-autocomplete-active')) {
                                    showDropdown();
                                }
                            } else {
                                hideDropdown();
                            }
                        });

                        observer.observe(autocompleteItems, {
                            childList: true,
                            subtree: true
                        });

                        // Handle click on toggle button
                        const toggleButton = navRef.current?.querySelector('.f3-autocomplete-toggle');
                        if (toggleButton) {
                            toggleButton.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (autocompleteItems.children.length > 0) {
                                    const isVisible = autocompleteItems.style.display !== 'none';
                                    if (isVisible) {
                                        hideDropdown();
                                    } else {
                                        showDropdown();
                                        autocompleteInput.focus();
                                    }
                                }
                            });
                        }

                        // Also hide when clicking outside
                        document.addEventListener('click', (e) => {
                            if (!autocompleteContainer.contains(e.target)) {
                                hideDropdown();
                            }
                        });

                        // AUTO-SEARCH logic: if a name or personId was passed in the URL, trigger the search effect
                        const targetId = params.get('personId');
                        const nameToSearch = searchName ? decodeURIComponent(searchName) : '';

                        if (targetId || searchName) {
                            if (searchName) autocompleteInput.value = nameToSearch;

                            let targetPerson;
                            if (targetId) {
                                // 1. Try to find exactly by unique internal ID (Precision)
                                targetPerson = treeData.find(p => String(p.id) === String(targetId));
                            }

                            if (!targetPerson && searchName) {
                                // 2. Fallback to name search if ID not found or not provided
                                targetPerson = treeData.find(p => getPersonName(p).toLowerCase() === nameToSearch.toLowerCase());
                            }

                            if (targetPerson) {
                                console.log("Automatically searching/focusing on person ID:", targetPerson.id);
                                f3Chart.updateMainId(targetPerson.id);
                                f3Chart.updateTree({ initial: false });
                            }
                        }
                    }
                }, 200);
            } catch (err) {
                console.error('Failed to initialize person search dropdown:', err);
            }

            const f3EditTree = f3Chart.editTree()
                .fixed(true)
                .setFields(["first name", "last name", "birthday", "anniversary", "gender", "mobile_no", "whatsapp_number", "achievements", "profession", "address", "death_date", "nick_name", "UNID", "familyId"])
                .setEditFirst(false)
                .setOnChange(async () => {
                    // THIS IS CALLED WHEN ADMIN UPDATES THE TREE (Add/Edit/Delete)
                    const updatedData = f3EditTree.getStoreDataCopy();
                    console.log('Saving updated data to Cloudflare Workers KV...');

                    setSaving(true);
                    const toastId = toast.loading("Syncing changes with Cloudflare...", {
                        position: "top-right",
                        theme: "dark"
                    });

                    try {
                        // 1. Save to LocalStorage for immediate fallback
                        localStorage.setItem('familyTreeData', JSON.stringify(updatedData));

                        // 2. PUSH TO CLOUDFLARE
                        const response = await fetch(CLOUDFLARE_WORKER_URL, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": ADMIN_SECRET_PASSWORD
                            },
                            body: JSON.stringify(updatedData)
                        });

                        if (response.ok) {
                            console.log('Successfully saved to Cloudflare');
                            toast.update(toastId, {
                                render: "Changes updated successfully!",
                                type: "success",
                                isLoading: false,
                                autoClose: 3000
                            });

                            // Reload immediately on success
                            window.location.reload();
                        } else {
                            console.error('Failed to save to Cloudflare:', response.statusText);
                            setSaving(false);
                            toast.update(toastId, {
                                render: "Failed to update database. Data kept in local cache.",
                                type: "error",
                                isLoading: false,
                                autoClose: 5000
                            });
                        }
                    } catch (error) {
                        console.error('Error in save process:', error);
                        setSaving(false);
                        toast.update(toastId, {
                            render: "A network error occurred. Please try again.",
                            type: "error",
                            isLoading: false,
                            autoClose: 5000
                        });
                    }
                })
                .setOnFormCreation((props) => {
                    const formContainer = props.cont;
                    const datumId = props.form_creator?.datum_id;
                    const personData = datumId
                        ? chartInstanceRef.current.store.getData().find(p => p.id === datumId)?.data
                        : null;
                    const avatarUrl = personData?.avatar;

                    // Always create image container, even if no avatar URL
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'profile-image-container';
                    imageContainer.style.cssText = `
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 20px 0;
                        margin-bottom: 20px;
                        position: relative;
                        ${user_type === 'admin' ? 'cursor: pointer;' : ''}
                    `;

                    // Create a dedicated wrapper for the circle image and icon
                    const imageWrapper = document.createElement('div');
                    imageWrapper.style.cssText = `
                        position: relative;
                        width: 120px;
                        height: 120px;
                    `;

                    const img = document.createElement('img');

                    // Use placeholder if no avatar URL
                    if (avatarUrl) {
                        img.src = avatarUrl;
                    } else {
                        // Create a placeholder SVG image
                        const placeholderSvg = `
                            <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="60" cy="60" r="60" fill="#555"/>
                                <circle cx="60" cy="45" r="20" fill="#888"/>
                                <path d="M 30 100 Q 30 80 60 80 Q 90 80 90 100" fill="#888"/>
                            </svg>
                        `;
                        img.src = 'data:image/svg+xml;base64,' + btoa(placeholderSvg);
                    }

                    img.alt = 'Profile Picture';
                    img.style.cssText = `
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        object-fit: cover;
                        border: 3px solid var(--text-color);
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                        transition: opacity 0.3s ease;
                    `;

                    imageWrapper.appendChild(img);

                    // IMAGE UPLOAD LOGIC FOR ADMINS
                    if (user_type === 'admin') {
                        // Add Edit Icon
                        const editIcon = document.createElement('div');
                        editIcon.innerHTML = f3.icons.userEditSvgIcon();
                        editIcon.style.cssText = `
                            position: absolute;
                            bottom: 5px;
                            right: 5px;
                            background: rgba(33, 33, 33, 0.85);
                            border: 1px solid #666;
                            border-radius: 50%;
                            width: 32px;
                            height: 32px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                            z-index: 5;
                            pointer-events: none; /* Let clicks pass to the container */
                        `;
                        // Adjust SVG size inside
                        const svg = editIcon.querySelector('svg');
                        if (svg) {
                            svg.setAttribute('width', '18');
                            svg.setAttribute('height', '18');
                            svg.style.fill = '#fff';
                        }
                        imageWrapper.appendChild(editIcon);

                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = 'image/*';
                        fileInput.style.display = 'none';
                        formContainer.appendChild(fileInput);

                        imageContainer.title = "Click to change profile picture";
                        imageContainer.onclick = () => fileInput.click();

                        fileInput.onchange = async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            const toastId = toast.loading("Uploading image...", {
                                position: "top-right",
                                theme: "dark"
                            });

                            img.style.opacity = "0.4";

                            const formData = new FormData();
                            formData.append("file", file);
                            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

                            try {
                                const response = await fetch(
                                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                                    { method: "POST", body: formData }
                                );

                                const data = await response.json();
                                if (data.secure_url) {
                                    img.src = data.secure_url;
                                    img.style.opacity = "1";

                                    // Ensure the 'avatar' input field exists in the form so the library captures it
                                    let avatarInput = formContainer.querySelector('input[name="avatar"]');
                                    if (!avatarInput) {
                                        // Create a hidden input if it's not in setFields
                                        avatarInput = document.createElement('input');
                                        avatarInput.type = 'hidden';
                                        avatarInput.name = 'avatar';
                                        formContainer.querySelector('.f3-form')?.appendChild(avatarInput);
                                    }

                                    if (avatarInput) {
                                        avatarInput.value = data.secure_url;
                                        // Trigger change event to notify the library
                                        avatarInput.dispatchEvent(new Event('input', { bubbles: true }));
                                    }

                                    toast.update(toastId, {
                                        render: "Image uploaded successfully!",
                                        type: "success",
                                        isLoading: false,
                                        autoClose: 3000
                                    });
                                }
                            } catch (error) {
                                console.error("Cloudinary upload failed:", error);
                                toast.update(toastId, {
                                    render: "Failed to upload image.",
                                    type: "error",
                                    isLoading: false,
                                    autoClose: 3000
                                });
                                img.style.opacity = "1";
                            }
                        };
                    }

                    imageContainer.appendChild(imageWrapper);

                    const formElement = formContainer.querySelector('.f3-form');
                    if (formElement && formElement.firstChild) {
                        formElement.insertBefore(imageContainer, formElement.firstChild);
                    } else if (formContainer.firstChild) {
                        formContainer.insertBefore(imageContainer, formContainer.firstChild);
                    }

                    if (user_type === 'user') {
                        const titleElement = formContainer.querySelector('.f3-edit-form-title');
                        if (titleElement) {
                            titleElement.textContent = 'Person Details';
                        }

                        const inputs = formContainer.querySelectorAll('input, textarea');
                        inputs.forEach(input => {
                            input.readOnly = true;
                            input.style.border = 'none';
                            input.style.backgroundColor = 'transparent';
                            input.style.color = 'inherit';
                        });

                        const submitButton = formContainer.querySelector('.f3-edit-form-submit-btn');
                        if (submitButton) submitButton.style.display = 'none';

                        const addRelativeButton = formContainer.querySelector('.f3-add-relative-btn');
                        if (addRelativeButton) addRelativeButton.style.display = 'none';

                        const removePersonButton = formContainer.querySelector('.f3-edit-form-delete-btn');
                        if (removePersonButton) removePersonButton.style.display = 'none';
                    } else if (user_type === 'admin') {
                        const formContainer = props.cont;

                        setTimeout(() => {
                            const addRelativeButton = formContainer.querySelector('.f3-add-relative-btn');
                            if (addRelativeButton) {
                                addRelativeButton.onclick = (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const currentPersonId = props.form_creator?.datum_id;
                                    const currentPerson = chartInstanceRef.current.store.getData().find(p => p.id === currentPersonId);

                                    if (currentPerson) {
                                        f3EditTree.addRelative(currentPerson);
                                        chartInstanceRef.current.updateMainId(currentPerson.id);
                                        chartInstanceRef.current.updateTree({});
                                    }
                                };
                            }

                            // Hide the "Remove Relation" button
                            const removeRelButtons = formContainer.querySelectorAll('.f3-edit-form-rel-delete-btn');
                            removeRelButtons.forEach(btn => btn.style.display = 'none');

                            // Fallback: search for any button that might contain "Remove Relation" text
                            const allButtons = formContainer.querySelectorAll('button, .f3-edit-form-submit-btn, .f3-edit-form-delete-btn');
                            allButtons.forEach(btn => {
                                if (btn.textContent && (btn.textContent.includes('Remove Relation') || btn.textContent.includes('remove relation'))) {
                                    btn.style.display = 'none';
                                }
                            });
                        }, 100);
                    }
                });

            if (user_type !== 'admin') {
                f3EditTree.setNoEdit();
            }

            f3EditTree.setEdit();

            const f3Card = f3Chart.setCardHtml()
                .setOnCardUpdate(function (d) {
                    if (d.data._new_rel_data) return;
                    if (f3EditTree.isRemovingRelative()) return;

                    const cardElement = this;
                    d3.select(cardElement).select('.card').style('cursor', 'pointer');
                    const card = cardElement.querySelector('.card-inner');

                    d3.select(card).style('position', 'relative');
                    d3.select(card).selectAll('.f3-svg-circle-hover').remove();

                    if (user_type === 'admin') {
                        const editButtonDiv = d3.select(card)
                            .append('div')
                            .attr('class', 'f3-svg-circle-hover edit-button')
                            .attr('style', 'cursor: pointer; width: 20px; height: 20px; position: absolute; top: 5px; right: 5px; z-index: 1000;')
                            .html(f3.icons.userEditSvgIcon());

                        editButtonDiv.select('svg').style('padding', '0');

                        const addButtonDiv = d3.select(card)
                            .append('div')
                            .attr('class', 'f3-svg-circle-hover add-button')
                            .attr('style', 'cursor: pointer; width: 20px; height: 20px; position: absolute; top: 5px; right: 30px; z-index: 1000;')
                            .html(f3.icons.userPlusSvgIcon());

                        addButtonDiv.select('svg').style('padding', '0');

                        const editButton = editButtonDiv.node();
                        const addButton = addButtonDiv.node();

                        const editHandler = (e) => {
                            e.stopPropagation();
                            f3EditTree.open(d.data);
                        };

                        const addHandler = (e) => {
                            e.stopPropagation();
                            f3EditTree.addRelative(d.data);
                            f3Chart.updateMainId(d.data.id);
                            f3Chart.updateTree({});
                        };

                        editButton.addEventListener('click', editHandler);
                        addButton.addEventListener('click', addHandler);
                    }
                });

            f3Card.setOnCardClick((e, d) => {
                if (user_type === 'user') {
                    f3EditTree.setNoEdit().open(d.data);
                    return;
                }

                if (d.data._new_rel_data) {
                    f3EditTree.open(d.data);
                    return;
                }

                if (f3EditTree.isAddingRelative() || f3EditTree.isRemovingRelative()) {
                    f3EditTree.closeForm();
                } else {
                    f3EditTree.open(d.data);
                }
            });

            f3Chart.updateTree({ initial: true });

            const originalCloseForm = f3EditTree.closeForm;
            f3EditTree.closeForm = function () {
                this.formCont.close();
                this.store.updateTree({ tree_position: 'inherit' });
            };

            setIsInitialized(true);

            const formContNode = containerRef.current.querySelector('.f3-form-cont');
            if (formContNode) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                            const isOpen = formContNode.classList.contains('opened');
                            setIsFormOpen(isOpen);
                        }
                    });
                });

                observer.observe(formContNode, { attributes: true });
                chartInstanceRef.current.formObserver = observer;
            }
        };

        const timer = setTimeout(initializeChart, 100);

        const currentNavRef = navRef.current;
        return () => {
            clearTimeout(timer);
            if (chartInstanceRef.current) {
                if (chartInstanceRef.current.formObserver) {
                    chartInstanceRef.current.formObserver.disconnect();
                }
                d3.select('#FamilyChart').selectAll('*').remove();
                chartInstanceRef.current = null;
            }
            if (currentNavRef) {
                currentNavRef.innerHTML = '';
            }
        };
    }, [treeData, userRole]); // Chart rebuilds if treeData or userRole changes

    // RENDER LOADING OR SAVING STATE
    if (loading || saving) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgb(33,33,33)',
                color: 'white'
            }}>
                <h2 style={{ marginBottom: '10px' }}>
                    {saving ? "Updating Family Tree..." : "Loading Family Tree..."}
                </h2>
                {saving && <p style={{ color: '#aaa' }}>Please wait while we sync with the database...</p>}
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', margin: 0 }}>
            <div
                className={`f3-controls ${isFormOpen ? 'hidden-mobile' : ''}`}
                style={{
                    position: 'absolute',
                    zIndex: 10,
                    padding: '10px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    maxWidth: '100%'
                }}>
                <div ref={navRef} style={{ minWidth: '250px' }} />
                {isInitialized && (
                    <button
                        onClick={() => {
                            setIsInitialized(false);
                            setResetKey(prev => prev + 1);
                        }}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: '#444',
                            color: 'white',
                            border: '1px solid #666',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '1px'
                        }}
                    >
                        Reset View
                    </button>
                )}
            </div>
            <div
                className="f3"
                id="FamilyChart"
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgb(33,33,33)',
                    color: '#fff'
                }}
            />
        </div>
    );
}
